// 菜西服务站的数据统计函数
class CaixiStation {
  constructor(grist) {
    this.grist = grist;
    this.cache = new Map();
  }

  async calculateValue(index) {
    try {
      switch(index) {
        case "7":
        case "7.1":
          const queyaoTable = await this.getTable("QueYao_CaiXi");
          return queyaoTable.id.length;
          
        case "1.01":
        case "1.03":
          const total2 = await this.getRowFromTable("MenZhenLiang_CaiXi", "A", "总合计");
          return this.sumValues(total2, ["C", "I", "W"]);

        case "1":
          // 获取1.1, 1.2, 1.3的值
          const mzTotalRow = await this.getRowFromTable("MenZhenLiang_CaiXi", "A", "总合计");
          const value1_1 = this.parseValue(mzTotalRow?.Z) || 0;  // 1.1的值
          const value1_2 = 0;  // 1.2的值（固定为0）
          const value1_3 = 0;  // 1.3的值（固定为0）
          return value1_1 + value1_2 + value1_3;

        case "1.04":
        case "1.05":
        case "1.1.4":
        case "1.2.1":
        case "1.3.1":
        case "1.3.2":
        case "2":
        case "6.5":
          return "无";

        case "1.1":
          const mzRow = await this.getRowFromTable("MenZhenLiang_CaiXi", "A", "总合计");
          return this.parseValue(mzRow?.Z);

        case "1.1.1":
          const qkRow = await this.getRowFromTable("MenZhenLiang_CaiXi", "A", "全科医疗科");
          return this.parseValue(qkRow?.Z);

        case "1.1.2":
          const zyRow = await this.getRowFromTable("MenZhenLiang_CaiXi", "A", "中医科");
          return this.parseValue(zyRow?.Z);

        case "1.1.3":
          // 获取1.1, 1.1.1, 1.1.2的值
          const mzTotal = await this.getRowFromTable("MenZhenLiang_CaiXi", "A", "总合计");
          const qkTotal = await this.getRowFromTable("MenZhenLiang_CaiXi", "A", "全科医疗科");
          const zyTotal = await this.getRowFromTable("MenZhenLiang_CaiXi", "A", "中医科");
          
          // 确保所有值都是数字
          const total = this.parseValue(mzTotal?.Z);
          const qk = this.parseValue(qkTotal?.Z);
          const zy = this.parseValue(zyTotal?.Z);
          return total - (qk + zy);

        case "1.2":
        case "1.3":
          return 0;

        case "6":
          const ypRow = await this.getRowFromTable("YaoPinChuFang_CaiXi", "A", "合计");
          return ypRow?.L || 0;

        case "6.1":
          const ksRow = await this.getRowFromTable("KangShengSu_CaiXi", "A", "合计");
          return ksRow?.F || 0;

        case "1.4":
          const ccfRow = await this.getRowFromTable("ChangChuFang_CaiXi", "B", "合计人次");
          return ccfRow?.C || 0;

        case "1.4.1":
        case "6.4":
          const mzfCount = await this.countMatchingRows("ChangChuFang_CaiXi", "E", "慢性阻塞性肺病");
          return mzfCount;

        case "6.3":
          const conditions = ["糖尿病", "高血压", "冠", "脑血"];
          const matchCount = await this.countMatchingRowsMultiCondition(
            "ChangChuFang_CaiXi", 
            "E", 
            conditions
          );
          return matchCount;

        default:
          return 0;
      }
    } catch (err) {
      console.error(`菜西服务站计算错误 [${index}]:`, err);
      return 0;
    }
  }

  // 获取表格数据(带缓存)
  async getTable(tableName) {
    try {
      console.log(`获取表格 ${tableName} 的数据`);
      if (!this.cache.has(tableName)) {
        const table = await this.grist.docApi.fetchTable(tableName);
        console.log(`${tableName} 表数据:`, table);
        this.cache.set(tableName, table);
      }
      return this.cache.get(tableName);
    } catch (err) {
      console.error(`获取表格 ${tableName} 失败:`, err);
      throw err;
    }
  }

  // 从当前表获取值
  async getValueFromCurrentTable(aValue, column) {
    const table = await this.getTable("table");
    const row = table.find(r => r.A === aValue);
    return row ? parseFloat(row[column]) || 0 : 0;
  }

  // 从指定表获取行
  async getRowFromTable(tableName, keyColumn, keyValue) {
    const table = await this.getTable(tableName);
    const index = table[keyColumn].findIndex(v => v === keyValue);
    if (index === -1) return null;
    
    const row = {};
    for (const [key, values] of Object.entries(table)) {
      if (key !== 'id') {
        // 如果是数值列，尝试转换为数字
        const value = values[index];
        row[key] = this.parseValue(value);
      }
    }
    return row;
  }

  // 计算多个列的和
  sumValues(row, columns) {
    if (!row) return 0;
    return columns.reduce((sum, col) => {
      const value = parseFloat(row[col]) || 0;
      return sum + value;
    }, 0);
  }

  // 统计匹配行数
  async countMatchingRows(tableName, column, searchText) {
    const table = await this.getTable(tableName);
    return table[column].filter(value => 
      value && value.toString().includes(searchText)
    ).length;
  }

  // 统计多条件匹配行数
  async countMatchingRowsMultiCondition(tableName, column, conditions) {
    const table = await this.getTable(tableName);
    return table[column].filter(value => {
      if (!value) return false;
      const text = value.toString().toLowerCase();
      return conditions.some(condition => 
        text.includes(condition.toLowerCase())
      );
    }).length;
  }

  // 修改获取值的方法，确保返回数值
  async getValueFromTable(table, aValue, column) {
    try {
      console.log(`从表格获取值: A=${aValue}, column=${column}`);
      const index = table.A.findIndex(v => v === aValue);
      console.log('找到的索引:', index);
      if (index === -1) {
        console.log(`未找到 A=${aValue} 的行`);
        return 0;
      }
      const value = table[column][index];
      console.log('获取到的值:', value);
      const numValue = parseFloat(value) || 0;
      console.log('转换后的数值:', numValue);
      return numValue;
    } catch (err) {
      console.error(`获取值失败 [${aValue}][${column}]:`, err);
      return 0;
    }
  }

  // 添加一个通用的值解析方法
  parseValue(value) {
    if (value === undefined || value === null || value === '') return 0;
    if (typeof value === 'number') return value;
    // 尝试转换为数字
    const num = parseFloat(value);
    return isNaN(num) ? value : num;
  }
} 