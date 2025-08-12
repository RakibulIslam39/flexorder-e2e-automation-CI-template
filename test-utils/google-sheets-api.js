const { GoogleSpreadsheet } = require('google-spreadsheet');
const { credentialsManager } = require('../config/credentials');

class GoogleSheetsAPI {
  constructor() {
    this.cfg = credentialsManager.getGoogleSheetsConfig();
    this.doc = null;
  }

  async initialize() {
    if (this.doc) return;
    this.doc = new GoogleSpreadsheet(this.cfg.sheetId);
    if (this.cfg.serviceAccountJson) {
      await this.doc.useServiceAccountAuth(this.cfg.serviceAccountJson);
    }
    await this.doc.loadInfo();
  }

  async getSheet(name = this.cfg.sheetName) {
    await this.initialize();
    const sheet = this.doc.sheetsByTitle[name];
    if (!sheet) throw new Error(`Sheet not found: ${name}`);
    return sheet;
  }

  async readSheetData(range = this.cfg.sheetRange, name = this.cfg.sheetName) {
    const sheet = await this.getSheet(name);
    await sheet.loadCells(range);
    const [start, end] = range.split(':');
    const startCol = this.#colToIndex(start.replace(/\d+/g, ''));
    const startRow = parseInt(start.replace(/\D+/g, ''), 10) - 1;
    const endCol = this.#colToIndex(end.replace(/\d+/g, ''));
    const endRow = parseInt(end.replace(/\D+/g, ''), 10) - 1;

    const data = [];
    for (let r = startRow; r <= endRow; r++) {
      const row = [];
      for (let c = startCol; c <= endCol; c++) {
        row.push(sheet.getCell(r, c).value || '');
      }
      data.push(row);
    }
    return data;
  }

  async writeSheetData(data, startCell = 'A1', name = this.cfg.sheetName) {
    const sheet = await this.getSheet(name);
    const startCol = this.#colToIndex(startCell.replace(/\d+/g, ''));
    const startRow = parseInt(startCell.replace(/\D+/g, ''), 10) - 1;
    await sheet.loadCells({ startRowIndex: startRow, startColumnIndex: startCol, endRowIndex: startRow + data.length + 1, endColumnIndex: startCol + (data[0]?.length || 1) + 1 });
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].length; j++) {
        sheet.getCell(startRow + i, startCol + j).value = data[i][j];
      }
    }
    await sheet.saveUpdatedCells();
  }

  async updateCell(value, cell, name = this.cfg.sheetName) {
    const sheet = await this.getSheet(name);
    const col = this.#colToIndex(cell.replace(/\d+/g, ''));
    const row = parseInt(cell.replace(/\D+/g, ''), 10) - 1;
    await sheet.loadCells(cell);
    sheet.getCell(row, col).value = value;
    await sheet.saveUpdatedCells();
  }

  #colToIndex(col) {
    let res = 0;
    for (let i = 0; i < col.length; i++) res = res * 26 + (col.charCodeAt(i) - 64);
    return res - 1;
  }

  async testConnection() {
    try {
      await this.initialize();
      return true;
    } catch {
      return false;
    }
  }
}

const googleSheetsAPI = new GoogleSheetsAPI();
module.exports = { GoogleSheetsAPI, googleSheetsAPI };

