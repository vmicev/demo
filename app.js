document.addEventListener('DOMContentLoaded', () => {
    // ========== 1. 基础 UI 与数值动画 ==========
    const updateClock = () => {
        const now = new Date();
        document.getElementById('sys-clock').innerText = now.toTimeString().split(' ')[0];
    };
    setInterval(updateClock, 1000);
    updateClock();

    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const suffix = counter.getAttribute('data-suffix') || '';
        const duration = 2000; 
        const stepTime = 50; 
        const steps = duration / stepTime;
        const increment = target / steps;
        
        let current = 0;
        const updateCounter = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.innerText = target.toLocaleString() + suffix;
                clearInterval(updateCounter);
            } else {
                counter.innerText = Math.ceil(current).toLocaleString() + suffix;
            }
        }, stepTime);
    });

    // 模拟实时延迟跳动 (2.1s - 4.8s 之间，满足 <= 5s)
    const latencyNode = document.getElementById('val-latency');
    setInterval(() => {
        const latency = (Math.random() * 2.8 + 2.0).toFixed(1);
        latencyNode.innerText = latency + 's';
    }, 1500);

    // ========== 2. 安全合规与数据治理日志 ==========
    const govLogStream = document.getElementById('govLogStream');
    const logs = [
        "[CDC] LIS_Result_Detail: 实时同步完成",
        "[ETL] HIS_Patient_Record: 批量格式化入库成功",
        "[MQ] EMR_Text_Report: 消息队列积压释放",
        "[治理] 脏数据清洗: 剔除无效身高校验 42 条",
        "[合规] 拦截警告: 尝试违规传输未脱敏患者手机号",
        "[安全] PACS_Image_Index: 影像加密索引创建成功",
        "[CDC] 手麻手术排班记录: 增量同步完成",
        "[ETL] 财务日结数据: 归档合并至数仓"
    ];

    let logTimer = null;
    const startLogStream = () => {
        if(logTimer) clearInterval(logTimer);
        logTimer = setInterval(() => {
            const msg = logs[Math.floor(Math.random() * logs.length)];
            const div = document.createElement('div');
            div.className = 'log-item';
            
            if (msg.includes('[合规] 拦截')) div.classList.add('danger');
            if (msg.includes('[安全]')) div.classList.add('highlight');
            
            const time = new Date().toISOString().split('T')[1].slice(0, 12);
            div.innerText = `[${time}] ${msg}`;
            
            govLogStream.appendChild(div);
            if(govLogStream.childNodes.length > 8) {
                govLogStream.removeChild(govLogStream.firstChild);
            }
            govLogStream.scrollTop = govLogStream.scrollHeight;
        }, 1000);
    };

    startLogStream();

    // 鼠标放上暂停滚动，移走恢复
    const govLogContainer = document.querySelector('.gov-log-container');
    govLogContainer.addEventListener('mouseenter', () => {
        if(logTimer) { clearInterval(logTimer); logTimer = null; }
    });
    govLogContainer.addEventListener('mouseleave', startLogStream);

    // 点击日志打开详情
    const logModal = document.getElementById('logDetailModal');
    const closeLogModalBtn = document.getElementById('closeLogModalBtn');
    
    govLogStream.addEventListener('click', (e) => {
        const item = e.target.closest('.log-item');
        if(item) {
            const text = item.innerText;
            const timeMatch = text.match(/\[(.*?)\]/);
            const time = timeMatch ? timeMatch[1] : '';
            const content = text.substring(text.indexOf(']') + 1).trim();
            
            const isDanger = item.classList.contains('danger');
            const colorClass = isDanger ? 'text-red' : (item.classList.contains('highlight') ? 'text-green' : 'text-blue');
            const advice = isDanger ? '阻断传输，要求源系统脱敏！' : '自动放行入库';
            const policy = isDanger ? '《医院患者隐私数据保护规范 v2.1》' : '默认汇聚通道策略';

            document.getElementById('modalLogBody').innerHTML = `
                <div class="detail-row"><span>时间戳：</span><strong class="text-blue">${time}</strong></div>
                <div class="detail-row"><span>事件内容：</span><strong class="${colorClass}">${content}</strong></div>
                <div class="detail-row"><span>处理建议：</span><strong>${advice}</strong></div>
                <div class="detail-row"><span>关联策略：</span><strong>${policy}</strong></div>
            `;
            logModal.classList.remove('hidden');
        }
    });

    closeLogModalBtn.addEventListener('click', () => logModal.classList.add('hidden'));
    logModal.addEventListener('click', (e) => {
        if(e.target === logModal) logModal.classList.add('hidden');
    });

    // ========== 3. ECharts 实例化 ==========
    const commonOpts = { backgroundColor: 'transparent', textStyle: { fontFamily: 'Inter' } };

    // 3.1 异构系统拓扑图 (Graph)
    let topologyChart = echarts.init(document.getElementById('topologyChart'));
    const subNodes = [
        { name: 'HIS.门诊', p: 'HIS', c: '#10b981' }, { name: 'HIS.住院', p: 'HIS', c: '#10b981' }, { name: 'HIS.药房', p: 'HIS', c: '#10b981' },
        { name: 'LIS.生化', p: 'LIS', c: '#10b981' }, { name: 'LIS.微生物', p: 'LIS', c: '#10b981' }, { name: 'LIS.血液', p: 'LIS', c: '#10b981' },
        { name: 'PACS.CT', p: 'PACS', c: '#f59e0b' }, { name: 'PACS.MRI', p: 'PACS', c: '#f59e0b' }, { name: 'PACS.超声', p: 'PACS', c: '#f59e0b' },
        { name: 'EMR.病程', p: 'EMR', c: '#10b981' }, { name: 'EMR.手术', p: 'EMR', c: '#10b981' }, { name: 'EMR.护理', p: 'EMR', c: '#10b981' },
        { name: '手麻.麻醉', p: '手麻', c: '#10b981' }, { name: '手麻.排班', p: '手麻', c: '#10b981' },
        { name: '心电.12导联', p: '心电', c: '#ef4444' }, { name: '心电.动态', p: '心电', c: '#ef4444' },
        { name: '医保.门诊', p: '医保', c: '#10b981' }, { name: '医保.住院', p: '医保', c: '#10b981' },
        { name: '耗材.出库', p: '耗材', c: '#f59e0b' }, { name: '耗材.库存', p: '耗材', c: '#f59e0b' },
        { name: '财务.日结', p: '财务', c: '#10b981' }, { name: '财务.预算', p: '财务', c: '#10b981' }
    ];

    const sysNodes = [
        { name: '大数据中台', symbolSize: 60, itemStyle: { color: '#1d4ed8' } },
        { name: 'HIS',  symbolSize: 40, category: 1, state: '正常', itemStyle: { color: '#10b981' } },
        { name: 'LIS',  symbolSize: 35, category: 1, state: '正常', itemStyle: { color: '#10b981' } },
        { name: 'PACS', symbolSize: 45, category: 1, state: '超时', itemStyle: { color: '#f59e0b' } },
        { name: 'EMR',  symbolSize: 40, category: 1, state: '正常', itemStyle: { color: '#10b981' } },
        { name: '手麻', symbolSize: 30, category: 1, state: '正常', itemStyle: { color: '#10b981' } },
        { name: '心电', symbolSize: 30, category: 1, state: '异常', itemStyle: { color: '#ef4444' } },
        { name: '医保', symbolSize: 35, category: 1, state: '正常', itemStyle: { color: '#10b981' } },
        { name: '耗材', symbolSize: 30, category: 1, state: '超时', itemStyle: { color: '#f59e0b' } },
        { name: '财务', symbolSize: 35, category: 1, state: '正常', itemStyle: { color: '#10b981' } },
        // 子节点
        ...subNodes.map(s => ({
            name: s.name, category: 2, symbolSize: 11,
            itemStyle: { color: s.c.replace(')', ', 0.5)').replace('rgb', 'rgba'), borderColor: s.c, borderWidth: 1.5 }
        }))
    ];

    const mainNodeNames = ['HIS','LIS','PACS','EMR','手麻','心电','医保','耗材','财务'];
    const sysLinks = [
        ...mainNodeNames.map(name => ({ source: name, target: '大数据中台', lineStyle: { width: 2 } })),
        ...subNodes.map(s => ({ source: s.name, target: s.p, lineStyle: { type: 'dashed', width: 1, opacity: 0.5 } }))
    ];

    const topoOption = {
        ...commonOpts,
        tooltip: {
            show: true,
            trigger: 'item',
            confine: true,
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            borderWidth: 0,
            padding: 0,
            extraCssText: 'background: transparent !important; border: none !important; box-shadow: none !important; border-radius: 0 !important; padding: 0 !important;',
            formatter: function(params) {
                if (params.dataType !== 'node' || params.data.name === '大数据中台') return '';

                // 子节点 tooltip
                if (params.data.category === 2) {
                    const parts = params.data.name.split('.');
                    const parentSys = parts[0];
                    const moduleName = parts[1];
                    const borderColor = params.data.itemStyle.borderColor || '#64748b';
                    const count = Math.floor(Math.random() * 3000 + 500);
                    const latency = (Math.random() * 80 + 20).toFixed(0);
                    const now = new Date();
                    const lastSync = new Date(now.getTime() - Math.floor(Math.random() * 60000));
                    const lastSyncStr = lastSync.toTimeString().split(' ')[0];
                    return `
                    <div class="echart-custom-tooltip" style="width: 210px; border-color: ${borderColor}; box-shadow: 0 0 16px ${borderColor}30;">
                        <div class="overlay-header" style="border-bottom-color: ${borderColor}60;">
                            <h4 style="margin:0; color:${borderColor}; font-size:13px;">
                                <i class="fa-solid fa-cube"></i> ${parentSys} → ${moduleName}
                            </h4>
                        </div>
                        <div class="overlay-body">
                            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:8px;">
                                <span style="color:#64748b;">当日处理量</span>
                                <strong style="color:#2c3e50;font-family:'Orbitron',sans-serif;">${count.toLocaleString()}</strong>
                            </div>
                            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:8px;">
                                <span style="color:#64748b;">平均耗时</span>
                                <strong style="color:#2c3e50;">${latency} ms</strong>
                            </div>
                            <div style="display:flex;justify-content:space-between;font-size:12px;">
                                <span style="color:#64748b;">最近同步</span>
                                <strong style="color:${borderColor};">${lastSyncStr}</strong>
                            </div>
                        </div>
                    </div>`;
                }

                // 主节点 tooltip
                const sysName = params.data.name;
                const state = params.data.state;
                const color = params.data.itemStyle.color;
                let latestData = "基础业务数据";
                if(sysName === 'HIS') latestData = "门诊流水";
                else if(sysName === 'LIS') latestData = "生化检验";
                else if(sysName === 'PACS') latestData = "CT影像";
                else if(sysName === 'EMR') latestData = "病程记录";
                else if(sysName === '手麻') latestData = "麻醉日志";
                else if(sysName === '心电') latestData = "心电波形";
                else if(sysName === '医保') latestData = "医保清算";
                else if(sysName === '耗材') latestData = "耗材出库";
                else if(sysName === '财务') latestData = "日结账单";
                let syncLogs = '';
                let now = new Date();
                for(let i=0; i<10; i++) {
                    let past = new Date(now.getTime() - (i * Math.floor(Math.random() * 3000 + 1000)));
                    let timeStr = past.toTimeString().split(' ')[0];
                    let action = '同步成功', colorClass = 'text-green';
                    if (state === '超时' && i < 2) { action = '等待响应'; colorClass = 'text-orange'; }
                    else if (state === '异常' && i === 0) { action = '连接拒绝'; colorClass = 'text-red'; }
                    else { const acts = ['抄取完成','解析入库','数据校验','写入成功']; action = acts[Math.floor(Math.random()*acts.length)]; }
                    syncLogs += `<div style="font-size:11px;margin-bottom:6px;display:flex;justify-content:space-between;border-bottom:1px solid rgba(0,0,0,0.08);padding-bottom:4px;">
                        <span style="color:#64748b;font-family:monospace;">[${timeStr}] ${latestData}_${Math.floor(Math.random()*1000)}</span>
                        <span class="${colorClass}">${action}</span></div>`;
                }
                return `
                <div class="echart-custom-tooltip" style="width: 280px; border-color: ${color}; box-shadow: 0 0 20px ${color}40;">
                    <div class="overlay-header" style="border-bottom-color: ${color}80;">
                        <h4 style="margin:0; color:${color};"><i class="fa-solid fa-server"></i> ${sysName} [${state}]</h4>
                    </div>
                    <div class="overlay-body">${syncLogs}</div>
                </div>`;
            }
        },
        color: ['#00d2ff', '#27ae60'],
        series: [
            {
                type: 'graph',
                layout: 'force',
                data: sysNodes,
                links: sysLinks,
                roam: true,
                label: { 
                    show: true, 
                    position: 'right',
                    formatter: function(params) {
                        if (params.name === '大数据中台') return params.name;
                        // 子节点：只显示点后的短名，字体更小
                        if (params.data.category === 2) {
                            return '{sub|' + params.name.split('.')[1] + '}';
                        }
                        let stateText = '';
                        if(params.data.state === '正常') stateText = '{normal|数据同步正常}';
                        else if(params.data.state === '超时') stateText = '{timeout|数据同步超时}';
                        else if(params.data.state === '异常') stateText = '{error|数据同步异常}';
                        return '{name|' + params.name + '}\n' + stateText;
                    },
                    rich: {
                        name: { color: '#2c3e50', fontSize: 13, padding: [0, 0, 4, 0] },
                        sub:  { color: '#94a3b8', fontSize: 9, opacity: 0.9 },
                        normal:  { color: '#10b981', fontSize: 10, opacity: 0.8 },
                        timeout: { color: '#f59e0b', fontSize: 10, opacity: 0.8 },
                        error:   { color: '#ef4444', fontSize: 10, opacity: 0.8 }
                    }
                },
                zoom: 1.6,
                force: { repulsion: [80, 320], edgeLength: [40, 120], gravity: 0.12, layoutAnimation: false },
                lineStyle: { color: 'rgba(59, 130, 246, 0.4)', width: 2, curveness: 0.2 },
                edgeSymbol: ['none', 'arrow'],
                edgeSymbolSize: [4, 8]
            }
        ]
    };
    
    // 使用 force 布局，子节点自然聚集在父节点周围
    topoOption.series[0].layout = 'force';
    topologyChart.setOption(topoOption);

    // 3.1.5 自动轮询高亮与 Tooltip 展示
    const peripheralNodes = mainNodeNames; // 只轮询主节点
    let pollIndex = 0;
    let pollTimer = null;

    const startPolling = () => {
        if (pollTimer) clearInterval(pollTimer);
        pollTimer = setInterval(() => {
            let nodeName = peripheralNodes[pollIndex];
            
            topologyChart.dispatchAction({ type: 'downplay', seriesIndex: 0 });
            topologyChart.dispatchAction({ type: 'hideTip' });

            topologyChart.dispatchAction({ type: 'highlight', seriesIndex: 0, name: nodeName });
            topologyChart.dispatchAction({ type: 'showTip', seriesIndex: 0, name: nodeName });
            
            pollIndex = (pollIndex + 1) % peripheralNodes.length;
        }, 4000);
    };

    // 启动默认轮询
    startPolling();

    // 手动交互时停止轮询
    topologyChart.on('mouseover', function(params) {
        if (params.dataType === 'node' && params.data.name !== '大数据中台') {
            if(pollTimer) {
                clearInterval(pollTimer);
                pollTimer = null;
            }
        }
    });

    // 鼠标移走后自动恢复轮询
    topologyChart.on('mouseout', function(params) {
        if (params.dataType === 'node' && params.data.name !== '大数据中台') {
            startPolling();
        }
    });

    // 3.2 采集模式负载折线图
    let ingestChart = echarts.init(document.getElementById('ingestChart'));
    let timeAxis = Array.from({length: 20}, (_, i) => 'T-' + (20-i));
    
    // 随机游走初始化平滑数据 — 三线值域重叠，步长加大，形成频繁交叉
    let cdcData = [1100];
    let etlData = [650];
    let mqData = [850];
    for (let i = 1; i < 20; i++) {
        cdcData.push(Math.max(400, Math.min(1500, cdcData[i-1] + (Math.random() * 320 - 160))));
        etlData.push(Math.max(400, Math.min(1500, etlData[i-1] + (Math.random() * 280 - 140))));
        mqData.push(Math.max(400, Math.min(1500, mqData[i-1] + (Math.random() * 300 - 150))));
    }

    const ingestOption = {
        ...commonOpts,
        grid: { top: 30, bottom: 20, left: 40, right: 20 },
        tooltip: { trigger: 'axis' },
        legend: { data: ['实时 CDC', '消息队列 MQ', '批量 ETL'], textStyle: { color: '#64748b' } },
        xAxis: { type: 'category', data: timeAxis, axisLabel: { color: '#64748b' } },
        yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(0,0,0,0.06)' } }, axisLabel: { color: '#64748b' } },
        series: [
            {
                name: '实时 CDC', type: 'line', data: cdcData, smooth: true, symbol: 'none',
                itemStyle: { color: '#3b82f6' },
                areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0, color: 'rgba(59,130,246,0.3)'}, {offset: 1, color: 'transparent'}]) }
            },
            {
                name: '消息队列 MQ', type: 'line', data: mqData, smooth: true, symbol: 'none',
                itemStyle: { color: '#10b981' },
                areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0, color: 'rgba(16,185,129,0.3)'}, {offset: 1, color: 'transparent'}]) }
            },
            {
                name: '批量 ETL', type: 'line', data: etlData, smooth: true, symbol: 'none',
                itemStyle: { color: '#ef4444' },
                areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0, color: 'rgba(239,68,68,0.3)'}, {offset: 1, color: 'transparent'}]) }
            }
        ]
    };
    ingestChart.setOption(ingestOption);

    setInterval(() => {
        cdcData.shift(); etlData.shift(); mqData.shift();
        
        let lastCdc = cdcData[cdcData.length - 1];
        let lastEtl = etlData[etlData.length - 1];
        let lastMq = mqData[mqData.length - 1];
        
        cdcData.push(Math.max(400, Math.min(1500, lastCdc + (Math.random() * 320 - 160))));
        etlData.push(Math.max(400, Math.min(1500, lastEtl + (Math.random() * 280 - 140))));
        mqData.push(Math.max(400, Math.min(1500, lastMq + (Math.random() * 300 - 150))));
        
        ingestChart.setOption({ series: [{data: cdcData}, {data: mqData}, {data: etlData}] });
    }, 1500);

    // 3.3 数据类型统一采集画像 (环形图)
    let dataTypeChart = echarts.init(document.getElementById('dataTypeChart'));
    const typeOption = {
        ...commonOpts,
        tooltip: { trigger: 'item' },
        legend: { top: 'center', right: 0, orient: 'vertical', textStyle: { color: '#64748b' } },
        series: [
            {
                name: '数据类型',
                type: 'pie',
                radius: ['50%', '80%'],
                center: ['35%', '50%'],
                avoidLabelOverlap: false,
                itemStyle: { borderRadius: 5, borderColor: '#f0f4f8', borderWidth: 2 },
                label: { show: false },
                data: [
                    { value: 1048, name: '结构化数据', itemStyle: { color: '#3b82f6' } },
                    { value: 735, name: '影像索引', itemStyle: { color: '#06b6d4' } },
                    { value: 580, name: '非结构化文本', itemStyle: { color: '#27ae60' } },
                    { value: 300, name: '时序数据', itemStyle: { color: '#f59e0b' } }
                ]
            }
        ]
    };
    dataTypeChart.setOption(typeOption);

    // ========== 3.4 扩展模块图表渲染 ==========
    
    // 3.4.1 数据治理中心：近7日清洗拦截趋势 (折线图)
    let govChart = echarts.init(document.getElementById('govChart'));
    const govOption = {
        ...commonOpts,
        tooltip: { trigger: 'axis' },
        legend: { data: ['HIS 门诊数据', 'LIS 检验报告', 'PACS 影像索引'], textStyle: { color: '#64748b' } },
        grid: { top: 30, left: 50, right: 20, bottom: 20 },
        xAxis: { type: 'category', boundaryGap: false, data: ['5-01', '5-02', '5-03', '5-04', '5-05', '5-06', '今日'], axisLabel: { color: '#64748b' } },
        yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(0,0,0,0.06)' } }, axisLabel: { color: '#64748b' } },
        series: [
            { name: 'HIS 门诊数据', type: 'line', smooth: true, data: [12000, 13200, 10100, 13400, 9000, 23000, 14293], itemStyle: { color: '#3b82f6' } },
            { name: 'LIS 检验报告', type: 'line', smooth: true, data: [2200, 1820, 1910, 2340, 2900, 3300, 3100], itemStyle: { color: '#10b981' } },
            { name: 'PACS 影像索引', type: 'line', smooth: true, data: [150, 232, 201, 154, 190, 330, 210], itemStyle: { color: '#f59e0b' } }
        ]
    };
    govChart.setOption(govOption);

    // 3.4.2 安全合规审计网：全院 API 调用拦截态势 (面积波峰图)
    let secChart = echarts.init(document.getElementById('secChart'));
    let secTimeAxis = Array.from({length: 24}, (_, i) => `${i}:00`);
    let secData = Array.from({length: 24}, () => Math.floor(Math.random() * 500 + 100));
    // 模拟夜间攻击波峰
    secData[2] += 1200; secData[3] += 1500; secData[4] += 800;
    
    const secOption = {
        ...commonOpts,
        tooltip: { trigger: 'axis' },
        grid: { top: 20, left: 50, right: 20, bottom: 20 },
        xAxis: { type: 'category', boundaryGap: false, data: secTimeAxis, axisLabel: { color: '#64748b' } },
        yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(0,0,0,0.06)' } }, axisLabel: { color: '#64748b' } },
        series: [{
            name: '高危越权拦截', type: 'line', smooth: true, symbol: 'none', sampling: 'average',
            itemStyle: { color: '#ef4444' },
            areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0, color: 'rgba(239,68,68,0.5)'}, {offset: 1, color: 'transparent'}]) },
            data: secData
        }]
    };
    secChart.setOption(secOption);

    // 3.4.3 智能分析：科室业务对比 (双轴柱线图)
    let biChart = echarts.init(document.getElementById('biChart'));
    const deptNames = ['心内科', '呼吸科', '神经内科', '骨科', '妇产科', '儿科', '消化内科', '内分泌', '泌尿外科', '普外科', '神经外科', '胸外科', '眼科', '耳鼻喉', '口腔科', '皮肤科', '急诊科', '感染科', '肿瘤科', '康复科'];
    const visitData = [1820, 2300, 1500, 1200, 1400, 2800, 1600, 1100, 950, 2100, 600, 550, 1350, 1280, 1650, 1900, 3200, 800, 750, 900];
    const costData = [320.5, 185.0, 290.0, 410.2, 260.0, 120.0, 210.0, 195.0, 380.0, 450.0, 620.0, 580.0, 150.0, 140.0, 310.0, 180.0, 210.0, 190.0, 850.0, 240.0];

    const biOption = {
        ...commonOpts,
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
        legend: { data: ['门急诊人次', '均次费用(元)'], textStyle: { color: '#64748b' } },
        grid: { top: 30, left: 50, right: 50, bottom: 20 },
        xAxis: [{ type: 'category', data: deptNames, axisPointer: { type: 'shadow' }, axisLabel: { color: '#64748b' } }],
        yAxis: [
            { type: 'value', name: '人次', axisLabel: { color: '#64748b' }, splitLine: { lineStyle: { color: 'rgba(0,0,0,0.06)' } } },
            { type: 'value', name: '费用', axisLabel: { formatter: '¥{value}', color: '#64748b' }, splitLine: { show: false } }
        ],
        series: [
            { name: '门急诊人次', type: 'bar', barWidth: '40%', data: visitData, itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] } },
            { name: '均次费用(元)', type: 'line', yAxisIndex: 1, smooth: true, data: costData, itemStyle: { color: '#f59e0b' }, symbolSize: 8 }
        ]
    };
    biChart.setOption(biOption);

    // 响应式
    window.addEventListener('resize', () => {
        topologyChart.resize();
        ingestChart.resize();
        dataTypeChart.resize();
        govChart.resize();
        secChart.resize();
        biChart.resize();
    });

    // ========== 4. Dock 导航与多模块切换逻辑 ==========
    const dockItems = document.querySelectorAll('.dock-item');
    const moduleModals = document.querySelectorAll('.sys-module-modal');
    const closeModuleBtns = document.querySelectorAll('.close-module-btn');

    const switchModule = (targetId) => {
        // 更新 Dock 激活状态
        dockItems.forEach(item => {
            if(item.dataset.target === targetId) item.classList.add('active');
            else item.classList.remove('active');
        });

        if (targetId === 'home') {
            moduleModals.forEach(mod => mod.classList.add('hidden'));
        } else {
            moduleModals.forEach(mod => {
                if (mod.id === `module-${targetId}`) mod.classList.remove('hidden');
                else mod.classList.add('hidden');
            });
            // 解决隐藏状态下图表容器宽度为0导致的渲染变形
            setTimeout(() => {
                if(targetId === 'gov') govChart.resize();
                if(targetId === 'sec') secChart.resize();
                if(targetId === 'bi') biChart.resize();
            }, 50);
        }
    };

    dockItems.forEach(item => {
        item.addEventListener('click', () => {
            switchModule(item.dataset.target);
        });
    });

    closeModuleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchModule('home');
        });
    });

    // ========== 5. KPI 卡片点击下钻 ==========
    const kpiCards = document.querySelectorAll('.kpi-card[data-kpi]');
    const kpiModals = document.querySelectorAll('.kpi-detail-modal');

    const openKpiModal = (kpiId) => {
        kpiModals.forEach(m => m.classList.add('hidden'));
        const target = document.getElementById(`kpi-modal-${kpiId}`);
        if (target) {
            target.classList.remove('hidden');
            // 延迟弹窗同步实时延迟数值
            if (kpiId === 'latency') {
                const modalLatency = document.getElementById('modal-latency-val');
                if (modalLatency && latencyNode) {
                    modalLatency.innerText = latencyNode.innerText;
                }
            }
        }
    };

    kpiCards.forEach(card => {
        card.addEventListener('click', () => openKpiModal(card.dataset.kpi));
    });

    // 关闭 KPI 弹窗
    document.querySelectorAll('.kpi-modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            kpiModals.forEach(m => m.classList.add('hidden'));
        });
    });
    kpiModals.forEach(m => {
        m.addEventListener('click', (e) => {
            if (e.target === m) m.classList.add('hidden');
        });
    });

});
