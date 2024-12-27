// 主要逻辑
class PublicHealthReport {
  constructor() {
    this.stations = {};
    this.reportData = [];
    this.init();
  }

  async init() {
    try {
      await this.initGrist();
      await this.loadStations();
      await this.loadReportData();
      this.renderReport();
    } catch (err) {
      this.showError('初始化失败: ' + err.message);
    }
  }

  async initGrist() {
    await grist.ready({
      requiredAccess: 'full',
      onEditOptions: true
    });
  }

  async loadStations() {
    // 初始化各个服务站的统计类
    this.stations = {
      caixi: new CaixiStation(grist),
      // ... 其他服务站
    };
  }

  async loadReportData() {
    try {
      // 获取所有可用的表
      const tables = await grist.docApi.listTables();
      console.log('可用的表:', tables);

      // 查找报表模板数据
      // 1. 先尝试查找名为 ReportTemplate 的表
      if (tables.includes('ReportTemplate')) {
        const templateTable = await grist.docApi.fetchTable('ReportTemplate');
        this.reportData = this.processTemplateData(templateTable);
        return;
      }

      // 2. 如果没有找到模板表，尝试从其他表中获取数据
      // 假设数据在名为 "Summary" 或 "报表" 的表中
      const possibleTableNames = ['Summary', '报表', 'Report', '统计表'];
      for (const tableName of possibleTableNames) {
        if (tables.includes(tableName)) {
          const tableData = await grist.docApi.fetchTable(tableName);
          this.reportData = this.processTemplateData(tableData);
          return;
        }
      }

      // 3. 如果还是没找到，创建默认模板数据
      this.reportData = this.createDefaultTemplate();

    } catch (err) {
      console.error('加载报表数据失败:', err);
      throw new Error('加载报表数据失败: ' + err.message);
    }
  }

  // 处理模板数据
  processTemplateData(tableData) {
    // 确保数据是数组形式
    const rows = [];
    const ids = tableData.id || [];
    
    for (let i = 0; i < ids.length; i++) {
      const row = {
        A: tableData.A?.[i] || '',
        B: tableData.B?.[i] || '',
        C: tableData.C?.[i] || '',
        D: tableData.D?.[i] || '',
        E: tableData.E?.[i] || '',
        F: tableData.F?.[i] || '',
        G: tableData.G?.[i] || '',
        H: tableData.H?.[i] || '',
        I: tableData.I?.[i] || '',
        J: tableData.J?.[i] || '',
        K: tableData.K?.[i] || '',
        L: tableData.L?.[i] || '',
        M: tableData.M?.[i] || ''
      };
      rows.push(row);
    }
    return rows;
  }

  // 创建默认模板
  createDefaultTemplate() {
    return [
      { A: "1", B: "门诊总人次数（人次）", C: "", D: "", E: "", F: "", G: "", H: "", I: "", J: "", K: "", L: "", M: "" },
      { A: "1.01", B: "其中：老年人诊疗人次数（人次）", C: "", D: "", E: "", F: "", G: "", H: "", I: "", J: "", K: "", L: "", M: "" },
      { A: "1.03", B: "对符合老年人优待政策（60岁以上户籍人口）免费通门诊医疗服务费个人自付会金额的老年人人次数", C: "", D: "", E: "", F: "", G: "", H: "", I: "", J: "", K: "", L: "", M: "" },
      { A: "1.04", B: "对60岁以上户籍老年人免费通门诊医疗服务费个人自付会金额的老年人人次数", C: "", D: "", E: "", F: "", G: "", H: "", I: "", J: "", K: "", L: "", M: "" },
      { A: "1.05", B: "对其他优待人群人次数（含其他自动减免减免的人次）免费通门诊医疗服务费个人自付会人次数", C: "", D: "", E: "", F: "", G: "", H: "", I: "", J: "", K: "", L: "", M: "" },
      { A: "1.1", B: "门诊（人次）", C: "", D: "", E: "", F: "", G: "", H: "", I: "", J: "", K: "", L: "", M: "" },
      { A: "1.1.1", B: "其中：全科", C: "", D: "", E: "", F: "", G: "", H: "", I: "", J: "", K: "", L: "", M: "" },
      { A: "1.1.2", B: "中医", C: "", D: "", E: "", F: "", G: "", H: "", I: "", J: "", K: "", L: "", M: "" },
      { A: "1.1.3", B: "其它", C: "", D: "", E: "", F: "", G: "", H: "", I: "", J: "", K: "", L: "", M: "" },
      { A: "1.1.4", B: "预约就诊人次数", C: "", D: "", E: "", F: "", G: "", H: "", I: "", J: "", K: "", L: "", M: "" },
      { A: "1.2", B: "急诊人次数（人次）", C: "", D: "", E: "", F: "", G: "", H: "", I: "", J: "", K: "", L: "", M: "" },
      { A: "1.2.1", B: "其中：急诊抢救人次数（人次）", C: "", D: "", E: "", F: "", G: "", H: "", I: "", J: "", K: "", L: "", M: "" },
      { A: "1.3", B: "出诊服务总人次数（人次）", C: "", D: "", E: "", F: "", G: "", H: "", I: "", J: "", K: "", L: "", M: "" },
      { A: "1.3.1", B: "其中：为老人出诊（人次）", C: "", D: "", E: "", F: "", G: "", H: "", I: "", J: "", K: "", L: "", M: "" },
      { A: "1.3.2", B: "其中：家庭卫生服务人次数", C: "", D: "", E: "", F: "", G: "", H: "", I: "", J: "", K: "", L: "", M: "" },
      { A: "1.4", B: "开具长处方人次数（人次）", C: "", D: "", E: "", F: "", G: "", H: "", I: "", J: "", K: "", L: "", M: "" },
      { A: "1.4.1", B: "其中：慢阻肺患者长处方人次数（人次）", C: "", D: "", E: "", F: "", G: "", H: "", I: "", J: "", K: "", L: "", M: "" },
      { A: "2", B: "出诊医务人员总人次数（人次）", C: "", D: "", E: "", F: "", G: "", H: "", I: "", J: "", K: "", L: "", M: "" },
      { A: "6", B: "门诊处方总数", C: "", D: "", E: "", F: "", G: "", H: "", I: "", J: "", K: "", L: "", M: "" },
      { A: "6.1", B: "其中：使用抗菌药物的处方数", C: "", D: "", E: "", F: "", G: "", H: "", I: "", J: "", K: "", L: "", M: "" },
      { A: "6.3", B: "慢性病患者长处方数", C: "", D: "", E: "", F: "", G: "", H: "", I: "", J: "", K: "", L: "", M: "" },
      { A: "6.4", B: "慢阻肺患者长处方数", C: "", D: "", E: "", F: "", G: "", H: "", I: "", J: "", K: "", L: "", M: "" },
      { A: "6.5", B: "延长处方数", C: "", D: "", E: "", F: "", G: "", H: "", I: "", J: "", K: "", L: "", M: "" },
      { A: "7", B: "就医登记人次数", C: "", D: "", E: "", F: "", G: "", H: "", I: "", J: "", K: "", L: "", M: "" },
      { A: "7.1", B: "其中：完成病历人次数", C: "", D: "", E: "", F: "", G: "", H: "", I: "", J: "", K: "", L: "", M: "" }
    ];
  }

  async renderReport() {
    const tbody = document.getElementById('reportBody');
    tbody.innerHTML = '';
    
    // 显示加载指示器
    document.getElementById('loadingIndicator').style.display = 'block';

    try {
      // 生成报表行
      for (const row of this.reportData) {
        const tr = await this.createReportRow(row);
        tbody.appendChild(tr);
      }

      // 添加折叠/展开功能
      this.setupRowCollapse();
    } catch (err) {
      this.showError('渲染报表失败: ' + err.message);
    } finally {
      // 隐藏加载指示器
      document.getElementById('loadingIndicator').style.display = 'none';
    }
  }

  async createReportRow(rowData) {
    try {
      console.log(`创建行 ${rowData.A}:`, rowData);
      
      const tr = document.createElement('tr');
      const level = this.getRowLevel(rowData.A);
      console.log(`行 ${rowData.A} 的层级:`, level);
      
      // 添加展开/折叠图标
      const hasChildren = this.hasChildren(rowData.A);
      console.log(`行 ${rowData.A} 是否有子行:`, hasChildren);
      
      const expanderHtml = hasChildren ? 
        `<span class="row-expander">${tr.classList.contains('row-collapsed') ? '►' : '▼'}</span>` : 
        '';
      
      // 设置行的类和数据属性
      tr.classList.add(`level-${level}`);
      if (hasChildren) {
        tr.classList.add('row-expandable');
        tr.dataset.level = level;
      }

      try {
        // 计算菜西服务站的数据
        console.log(`开始计算行 ${rowData.A} 的菜西数据`);
        const caixiValue = await this.stations.caixi.calculateValue(rowData.A);
        console.log(`行 ${rowData.A} 的菜西数据计算结果:`, caixiValue);
        
        tr.innerHTML = `
          <td>${rowData.A}</td>
          <td class="indent-${level}">${expanderHtml}${rowData.B}</td>
          <td class="value-cell" data-station="huaibai">${rowData.C || ''}</td>
          <td class="value-cell" data-station="xibianmen">${rowData.D || ''}</td>
          <td class="value-cell" data-station="sanmiao">${rowData.E || ''}</td>
          <td class="value-cell" data-station="changxi">${rowData.F || ''}</td>
          <td class="value-cell" data-station="caixi">${caixiValue}</td>
          <td class="value-cell" data-station="quanke">${rowData.H || ''}</td>
          <td class="value-cell" data-station="zhongyi">${rowData.I || ''}</td>
          <td class="value-cell" data-station="kouqiang">${rowData.J || ''}</td>
          <td class="value-cell" data-station="baojian">${rowData.K || ''}</td>
          <td class="value-cell" data-station="centerTotal">${rowData.L || ''}</td>
          <td class="value-cell" data-station="total">${rowData.M || ''}</td>
        `;
      } catch (err) {
        console.error(`计算行 ${rowData.A} 的数据失败:`, err);
        tr.querySelector('[data-station="caixi"]').innerHTML = '<span class="error-mark" title="计算失败">!</span>';
      }

      return tr;
    } catch (err) {
      console.error('创建行失败:', err);
      throw err;
    }
  }

  getRowLevel(index) {
    // 根据序号判断层级
    const parts = index.toString().split('.');
    return parts.length;
  }

  setupRowCollapse() {
    // 实现行折叠/展开功能
    document.querySelectorAll('.row-expandable').forEach(row => {
      row.addEventListener('click', () => {
        const level = parseInt(row.dataset.level);
        const nextRow = row.nextElementSibling;
        
        while (nextRow && parseInt(nextRow.dataset.level) > level) {
          nextRow.classList.toggle('hidden');
          nextRow = nextRow.nextElementSibling;
        }
      });
    });
  }

  showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }

  // 判断是否有子行
  hasChildren(index) {
    const currentLevel = this.getRowLevel(index);
    const nextRow = this.reportData.find(row => 
      row.A.startsWith(index + '.') && 
      this.getRowLevel(row.A) === currentLevel + 1
    );
    return !!nextRow;
  }
}

// 初始化报表
new PublicHealthReport(); 