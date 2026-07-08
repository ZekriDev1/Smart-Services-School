/**
 * SMARTSERVICES Schools - Request & Invoice Service
 */

const requestRepository = require('../repositories/request.repository');
const invoiceRepository = require('../repositories/invoice.repository');
const logger = require('../utils/logger');

class RequestService {
  async createRequest(requestData, userId) {
    logger.info(`Creating service request for user: ${userId}`);
    const request = await requestRepository.create(requestData, userId);
    
    // Automatically generate an invoice if needed or wait until status is completed/approved.
    // For demo/real integration, we can create a pending invoice on request creation 
    // to simulate billing processes.
    await invoiceRepository.create({
      request_id: request.id,
      user_id: userId,
      service_name: request.service_name,
      amount: request.budget || 1500.00, // default or dynamic budget
      tax: (request.budget || 1500.00) * 0.2, // 20% default Moroccan VAT
      total_amount: (request.budget || 1500.00) * 1.2,
      currency: 'MAD',
      status: 'pending',
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days due
    });

    return request;
  }

  async getRequestDetails(id) {
    return requestRepository.findById(id);
  }

  async listRequests(filters, userId) {
    return requestRepository.listAll(filters, userId);
  }

  async listInvoices(filters, userId) {
    return invoiceRepository.listAll(filters, userId);
  }

  async updateRequestStatus(id, status, notes, userId) {
    logger.info(`Updating request ID ${id} status to: ${status} by user ${userId}`);
    
    const request = await requestRepository.findById(id);
    if (!request) {
      throw new Error('Request not found');
    }

    const updated = await requestRepository.updateStatus(id, status, notes);

    // If status is updated to completed, check and update the associated invoice status
    if (status === 'completed') {
      const { data: invoices } = await invoiceRepository.listAll({ limit: 10 }, request.user_id);
      const requestInvoice = invoices.find(inv => inv.request_id === id);
      if (requestInvoice && requestInvoice.status === 'pending') {
        // Auto mark as paid for demonstration or let it be.
      }
    }

    return updated;
  }
}

module.exports = new RequestService();
