/**
 * SMARTSERVICES Schools - Inventory & Transaction Service
 */

const { supabase, query, hasDirectDb } = require('../config/db');
const productRepository = require('../repositories/product.repository');
const inventoryRepository = require('../repositories/inventory.repository');
const logger = require('../utils/logger');

class InventoryService {
  
  // ============================================
  // PRODUCT & BARCODE OPERATIONS
  // ============================================

  async createProduct(productData, userId = null) {
    logger.info(`Creating product: ${productData.name} (Barcode: ${productData.barcode})`);
    
    // Check barcode duplication
    const existing = await productRepository.findByBarcode(productData.barcode);
    if (existing) {
      throw new Error(`Product with barcode ${productData.barcode} already exists`);
    }

    const product = await productRepository.create(productData);

    // Initialize inventory level
    await inventoryRepository.initialize(
      product.id,
      productData.min_stock || 5,
      productData.max_stock || 100,
      productData.bin_location || ''
    );

    // Log barcode history (register scan)
    await inventoryRepository.logBarcodeScan(
      product.barcode,
      product.id,
      'register',
      userId,
      'Product registered and inventory initialized'
    );

    return this.getProductDetails(product.id);
  }

  async updateProduct(id, productData) {
    logger.info(`Updating product ID: ${id}`);
    
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new Error('Product not found');
    }

    // Check barcode uniqueness if changed
    if (productData.barcode && productData.barcode !== existing.barcode) {
      const duplicate = await productRepository.findByBarcode(productData.barcode);
      if (duplicate) {
        throw new Error(`Another product already uses barcode ${productData.barcode}`);
      }
    }

    const product = await productRepository.update(id, productData);
    
    // Update inventory stock levels if provided
    if (productData.min_stock !== undefined || productData.max_stock !== undefined || productData.bin_location !== undefined) {
      const inv = await inventoryRepository.findByProductId(id);
      if (inv) {
        await inventoryRepository.update(id, {
          quantity: inv.quantity,
          min_stock: productData.min_stock !== undefined ? productData.min_stock : inv.min_stock,
          max_stock: productData.max_stock !== undefined ? productData.max_stock : inv.max_stock,
          bin_location: productData.bin_location !== undefined ? productData.bin_location : inv.bin_location
        });
      }
    }

    return this.getProductDetails(id);
  }

  async lookupBarcode(barcode, userId = null) {
    logger.info(`Scanning barcode: ${barcode}`);
    
    const product = await productRepository.findByBarcode(barcode);
    
    if (!product) {
      // Log lookup scan even if product is not found
      await inventoryRepository.logBarcodeScan(barcode, null, 'lookup', userId, 'Barcode not found in system');
      throw new Error(`Product with barcode ${barcode} not found`);
    }

    // Load current inventory
    const inventory = await inventoryRepository.findByProductId(product.id);
    
    // Log lookup scan
    await inventoryRepository.logBarcodeScan(barcode, product.id, 'lookup', userId, `Barcode scanned. Current stock: ${inventory ? inventory.quantity : 0}`);

    return {
      product,
      inventory: inventory || { quantity: 0 }
    };
  }

  async getProductDetails(id) {
    const product = await productRepository.findById(id);
    if (!product) return null;

    const inventory = await inventoryRepository.findByProductId(id);
    return {
      ...product,
      inventory
    };
  }

  async updateInventoryLevel(productId, invData) {
    const existing = await inventoryRepository.findByProductId(productId);
    if (!existing) {
      throw new Error('Inventory level record not found');
    }

    return inventoryRepository.update(productId, {
      quantity: invData.quantity !== undefined ? invData.quantity : existing.quantity,
      min_stock: invData.min_stock !== undefined ? invData.min_stock : existing.min_stock,
      max_stock: invData.max_stock !== undefined ? invData.max_stock : existing.max_stock,
      bin_location: invData.bin_location !== undefined ? invData.bin_location : existing.bin_location
    });
  }

  // ============================================
  // TRANSACTION: SALES OPERATIONS
  // ============================================

  async executeSale(saleData, userId) {
    logger.info(`Initiating sale transaction by User: ${userId}`);

    // If direct PG database exists, run atomic SQL transaction
    if (hasDirectDb()) {
      return this._executeSaleSql(saleData, userId);
    }

    // Fallback: API-based transaction
    return this._executeSaleApi(saleData, userId);
  }

  async _executeSaleSql(saleData, userId) {
    const productIds = saleData.items.map(item => item.product_id);
    
    // Start transaction
    await query('BEGIN');
    try {
      // 1. Fetch and Lock products & inventory
      const lockedItems = await query(
        `SELECT p.id, p.sell_price, p.name, p.barcode, i.quantity 
         FROM public.products p 
         JOIN public.inventory i ON p.id = i.product_id 
         WHERE p.id = ANY($1) FOR UPDATE`,
        [productIds]
      );

      const itemsMap = {};
      lockedItems.rows.forEach(row => {
        itemsMap[row.id] = row;
      });

      // 2. Validate quantities and calculate totals
      let totalAmount = 0.00;
      const saleItemsToInsert = [];

      for (const item of saleData.items) {
        const dbProduct = itemsMap[item.product_id];
        if (!dbProduct) {
          throw new Error(`Product ${item.product_id} not found in database`);
        }

        if (dbProduct.quantity < item.quantity) {
          throw new Error(`Insufficient stock for product "${dbProduct.name}". Current stock: ${dbProduct.quantity}, requested: ${item.quantity}`);
        }

        const unitPrice = dbProduct.sell_price;
        const totalPrice = unitPrice * item.quantity;
        totalAmount += totalPrice;

        saleItemsToInsert.push({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: unitPrice,
          total_price: totalPrice,
          barcode: dbProduct.barcode
        });
      }

      // 3. Create Sale Header
      const saleResult = await query(
        `INSERT INTO public.sales (customer_id, user_id, total_amount, payment_status, payment_method, notes) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, sale_date`,
        [
          saleData.customer_id || null, 
          userId, 
          totalAmount, 
          saleData.payment_status || 'paid', 
          saleData.payment_method || 'cash', 
          saleData.notes || ''
        ]
      );
      const saleId = saleResult.rows[0].id;

      // 4. Create Sale Items and update Stock Levels
      for (const item of saleItemsToInsert) {
        // Insert item record
        await query(
          `INSERT INTO public.sale_items (sale_id, product_id, quantity, unit_price, total_price) 
           VALUES ($1, $2, $3, $4, $5)`,
          [saleId, item.product_id, item.quantity, item.unit_price, item.total_price]
        );

        // Deduct inventory stock levels
        await query(
          `UPDATE public.inventory SET quantity = quantity - $1 WHERE product_id = $2`,
          [item.quantity, item.product_id]
        );

        // Log scan lookup / sale scan
        await query(
          `INSERT INTO public.barcode_history (barcode, product_id, action_type, user_id, notes) 
           VALUES ($1, $2, $3, $4, $5)`,
          [item.barcode, item.product_id, 'sale', userId, `Sold quantity: ${item.quantity}`]
        );
      }

      // 5. Create general financial Transaction record
      await query(
        `INSERT INTO public.transactions (type, amount, payment_method, reference_id, notes) 
         VALUES ($1, $2, $3, $4, $5)`,
        ['sale', totalAmount, saleData.payment_method || 'cash', saleId, `Sale record transaction #${saleId}`]
      );

      // Commit
      await query('COMMIT');
      logger.info(`✅ SQL Sale Transaction completed successfully: Sale ID #${saleId}`);
      return { saleId, totalAmount, date: saleResult.rows[0].sale_date };

    } catch (err) {
      await query('ROLLBACK');
      logger.error('❌ SQL Sale Transaction failed (rolled back):', err);
      throw err;
    }
  }

  async _executeSaleApi(saleData, userId) {
    // API-based flow using Supabase Client APIs.
    // Read current stock levels
    const productIds = saleData.items.map(item => item.product_id);
    
    const { data: products, error: pError } = await supabase
      .from('products')
      .select('id, name, sell_price, barcode')
      .in('id', productIds);

    if (pError || !products) throw new Error('Failed to load products for sale validation');

    const { data: inventoryList, error: iError } = await supabase
      .from('inventory')
      .select('product_id, quantity')
      .in('product_id', productIds);

    if (iError || !inventoryList) throw new Error('Failed to load inventory for sale validation');

    const productsMap = {};
    products.forEach(p => { productsMap[p.id] = p; });

    const inventoryMap = {};
    inventoryList.forEach(i => { inventoryMap[i.product_id] = i.quantity; });

    let totalAmount = 0.00;
    const saleItemsToInsert = [];

    // Verify quantities
    for (const item of saleData.items) {
      const prod = productsMap[item.product_id];
      const stock = inventoryMap[item.product_id] || 0;

      if (!prod) throw new Error(`Product ${item.product_id} not found`);
      if (stock < item.quantity) {
        throw new Error(`Insufficient stock for product "${prod.name}". Current stock: ${stock}, requested: ${item.quantity}`);
      }

      const itemTotal = prod.sell_price * item.quantity;
      totalAmount += itemTotal;

      saleItemsToInsert.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: prod.sell_price,
        total_price: itemTotal,
        barcode: prod.barcode
      });
    }

    // Insert sale header
    const { data: sale, error: saleErr } = await supabase
      .from('sales')
      .insert([
        {
          customer_id: saleData.customer_id || null,
          user_id: userId,
          total_amount: totalAmount,
          payment_status: saleData.payment_status || 'paid',
          payment_method: saleData.payment_method || 'cash',
          notes: saleData.notes || ''
        }
      ])
      .select()
      .single();

    if (saleErr || !sale) throw new Error(`Failed to create sale: ${saleErr.message}`);

    // Create sale items and update stock sequentially
    for (const item of saleItemsToInsert) {
      // Insert item
      const { error: itemErr } = await supabase
        .from('sale_items')
        .insert([
          {
            sale_id: sale.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price
          }
        ]);
      if (itemErr) throw itemErr;

      // Update inventory (decrement)
      await inventoryRepository.updateStock(item.product_id, -item.quantity);

      // Log barcode scan scan
      await inventoryRepository.logBarcodeScan(item.barcode, item.product_id, 'sale', userId, `Sold quantity: ${item.quantity}`);
    }

    // Create transaction log
    await supabase.from('transactions').insert([
      {
        type: 'sale',
        amount: totalAmount,
        payment_method: saleData.payment_method || 'cash',
        reference_id: sale.id,
        notes: `Sale record transaction #${sale.id}`
      }
    ]);

    logger.info(`✅ API Sale Transaction completed successfully: Sale ID #${sale.id}`);
    return { saleId: sale.id, totalAmount, date: sale.sale_date };
  }

  // ============================================
  // TRANSACTION: PURCHASES OPERATIONS
  // ============================================

  async executePurchase(purchaseData, userId) {
    logger.info(`Initiating purchase transaction by User: ${userId}`);

    if (hasDirectDb()) {
      return this._executePurchaseSql(purchaseData, userId);
    }
    return this._executePurchaseApi(purchaseData, userId);
  }

  async _executePurchaseSql(purchaseData, userId) {
    const productIds = purchaseData.items.map(item => item.product_id);
    await query('BEGIN');
    try {
      const lockedItems = await query(
        `SELECT p.id, p.barcode 
         FROM public.products p 
         JOIN public.inventory i ON p.id = i.product_id 
         WHERE p.id = ANY($1) FOR UPDATE`,
        [productIds]
      );

      const itemsMap = {};
      lockedItems.rows.forEach(row => {
        itemsMap[row.id] = row;
      });

      let totalAmount = 0.00;
      const purchaseItemsToInsert = [];

      for (const item of purchaseData.items) {
        const dbProduct = itemsMap[item.product_id];
        if (!dbProduct) {
          throw new Error(`Product ${item.product_id} not found in database`);
        }

        const totalPrice = item.unit_price * item.quantity;
        totalAmount += totalPrice;

        purchaseItemsToInsert.push({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: totalPrice,
          barcode: dbProduct.barcode
        });
      }

      // Insert Purchase Header
      const purchaseResult = await query(
        `INSERT INTO public.purchases (supplier_id, user_id, total_amount, status, notes) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id, purchase_date`,
        [
          purchaseData.supplier_id || null, 
          userId, 
          totalAmount, 
          purchaseData.status || 'received', 
          purchaseData.notes || ''
        ]
      );
      const purchaseId = purchaseResult.rows[0].id;

      // Insert Purchase Items and update Stock Levels
      for (const item of purchaseItemsToInsert) {
        await query(
          `INSERT INTO public.purchase_items (purchase_id, product_id, quantity, unit_price, total_price) 
           VALUES ($1, $2, $3, $4, $5)`,
          [purchaseId, item.product_id, item.quantity, item.unit_price, item.total_price]
        );

        // Increment stock level
        await query(
          `UPDATE public.inventory SET quantity = quantity + $1 WHERE product_id = $2`,
          [item.quantity, item.product_id]
        );

        // Log scan lookup / purchase scan
        await query(
          `INSERT INTO public.barcode_history (barcode, product_id, action_type, user_id, notes) 
           VALUES ($1, $2, $3, $4, $5)`,
          [item.barcode, item.product_id, 'purchase', userId, `Purchased quantity: ${item.quantity}`]
        );
      }

      // Create general financial Transaction record
      await query(
        `INSERT INTO public.transactions (type, amount, reference_id, notes) 
         VALUES ($1, $2, $3, $4)`,
        ['purchase', totalAmount, purchaseId, `Purchase restock transaction #${purchaseId}`]
      );

      await query('COMMIT');
      logger.info(`✅ SQL Purchase Transaction completed: Purchase ID #${purchaseId}`);
      return { purchaseId, totalAmount, date: purchaseResult.rows[0].purchase_date };

    } catch (err) {
      await query('ROLLBACK');
      logger.error('❌ SQL Purchase Transaction failed (rolled back):', err);
      throw err;
    }
  }

  async _executePurchaseApi(purchaseData, userId) {
    const productIds = purchaseData.items.map(item => item.product_id);
    
    const { data: products, error: pError } = await supabase
      .from('products')
      .select('id, name, barcode')
      .in('id', productIds);

    if (pError || !products) throw new Error('Failed to load products for purchase validation');

    const productsMap = {};
    products.forEach(p => { productsMap[p.id] = p; });

    let totalAmount = 0.00;
    const purchaseItemsToInsert = [];

    for (const item of purchaseData.items) {
      const prod = productsMap[item.product_id];
      if (!prod) throw new Error(`Product ${item.product_id} not found`);

      const itemTotal = item.unit_price * item.quantity;
      totalAmount += itemTotal;

      purchaseItemsToInsert.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: itemTotal,
        barcode: prod.barcode
      });
    }

    // Insert purchase header
    const { data: purchase, error: purchaseErr } = await supabase
      .from('purchases')
      .insert([
        {
          supplier_id: purchaseData.supplier_id || null,
          user_id: userId,
          total_amount: totalAmount,
          status: purchaseData.status || 'received',
          notes: purchaseData.notes || ''
        }
      ])
      .select()
      .single();

    if (purchaseErr || !purchase) throw new Error(`Failed to create purchase: ${purchaseErr.message}`);

    // Create purchase items and update stock sequentially
    for (const item of purchaseItemsToInsert) {
      const { error: itemErr } = await supabase
        .from('purchase_items')
        .insert([
          {
            purchase_id: purchase.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price
          }
        ]);
      if (itemErr) throw itemErr;

      // Update inventory (increment)
      await inventoryRepository.updateStock(item.product_id, item.quantity);

      // Log barcode scan scan
      await inventoryRepository.logBarcodeScan(item.barcode, item.product_id, 'purchase', userId, `Purchased quantity: ${item.quantity}`);
    }

    // Create transaction log
    await supabase.from('transactions').insert([
      {
        type: 'purchase',
        amount: totalAmount,
        reference_id: purchase.id,
        notes: `Purchase restock transaction #${purchase.id}`
      }
    ]);

    logger.info(`✅ API Purchase Transaction completed: Purchase ID #${purchase.id}`);
    return { purchaseId: purchase.id, totalAmount, date: purchase.purchase_date };
  }
}

module.exports = new InventoryService();
