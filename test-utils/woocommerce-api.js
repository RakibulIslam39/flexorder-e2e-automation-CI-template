const WooCommerceRestApi = require('@woocommerce/woocommerce-rest-api').default;
const { credentialsManager } = require('../config/credentials');

class WooCommerceAPI {
  constructor() {
    const cfg = credentialsManager.getWooCommerceConfig();
    this.api = new WooCommerceRestApi({
      url: cfg.baseUrl,
      consumerKey: cfg.consumerKey,
      consumerSecret: cfg.consumerSecret,
      version: cfg.apiVersion,
      queryStringAuth: true,
    });
  }

  async testConnection() {
    try {
      await this.api.get('');
      return true;
    } catch (e) {
      return false;
    }
  }

  async createOrder(orderData) {
    const { data } = await this.api.post('orders', orderData);
    return data;
  }

  async getOrder(id) {
    const { data } = await this.api.get(`orders/${id}`);
    return data;
  }

  async updateOrderStatus(id, status) {
    const { data } = await this.api.put(`orders/${id}`, { status });
    return data;
  }

  async createProduct(product) {
    const { data } = await this.api.post('products', product);
    return data;
  }

  async getOrders(params = {}) {
    const { data } = await this.api.get('orders', { params });
    return data;
  }
}

const woocommerceAPI = new WooCommerceAPI();
module.exports = { WooCommerceAPI, woocommerceAPI };

