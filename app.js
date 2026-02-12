const { createApp } = Vue;
const draggable = window.vuedraggable;

const app = createApp({
  components: { draggable },
  data() {
    return {
      loading: true,
      scrolled: false,
      tabs: ['行程', '導航', '憑證', '清單', '記帳'],
      currentTab: '行程',
      supabaseUrl: '',
      anonKey: '',
      supabaseClient: null,
      tripData: { title: '我的日本之旅', wakeup_time: '09:00', sleep_time: '22:00' },
      scheduleList: [],
      shoppingList: [],
      dragging: false,
      selectedId: null,
    };
  },
  mounted() {
    setTimeout(() => { this.loading = false; }, 1800);
    window.addEventListener('scroll', () => { this.scrolled = window.scrollY > 120; });
  },
  methods: {
    setTab(tab) { this.currentTab = tab; },
    getIcon(tab) {
      const map = { '行程': 'fas fa-calendar-day', '導航': 'fas fa-map-marked-alt', '憑證': 'fas fa-ticket-alt', '清單': 'fas fa-list-ul', '記帳': 'fas fa-yen-sign' };
      return map[tab];
    },
    initSupabase() {
      this.supabaseClient = supabase.createClient(this.supabaseUrl, this.anonKey);
      this.loadAllData();
      // 每10分鐘自動存檔
      setInterval(() => this.autoSave(), 600000);
    },
    async loadAllData() {
      if (!this.supabaseClient) return;
      const { data: schedules } = await this.supabaseClient.from('schedules').select('*').order('sort_order');
      this.scheduleList = schedules || [];
      const { data: shopping } = await this.supabaseClient.from('shopping_list').select('*');
      this.shoppingList = shopping || [];
    },
    // Time Engine
    timeToMinutes(t) { if (!t) return 0; const [h, m] = t.split(':').map(Number); return h*60 + m; },
    minutesToTime(m) { const h = Math.floor(m/60)%24; return `\( {String(h).padStart(2,'0')}: \){String(m%60).padStart(2,'0')}`; },
    handleTimeInput(e, item, field) {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length === 4) val = val.slice(0,2) + ':' + val.slice(2);
      item[field] = val;
      const idx = this.scheduleList.findIndex(i => i.id === item.id);
      this.updateScheduleChain(this.scheduleList, idx);
      this.saveSchedule(item);
    },
    updateScheduleChain(list, startIdx) {
      for (let i = startIdx; i < list.length; i++) {
        const cur = list[i];
        const start = this.timeToMinutes(cur.start_time);
        const dur = this.timeToMinutes(cur.duration || '00:00');
        cur.end_time = this.minutesToTime(start + dur);
        if (list[i+1]) list[i+1].start_time = cur.end_time;
      }
    },
    getTransportTitle(item) {
      if (!item.transport_segments || item.transport_segments.length === 0) return item.title;
      const segs = item.transport_segments;
      return `${segs[0].from_station} ➜ ${segs[segs.length-1].to_station}`;
    },
    // Drag & Drop
    onDragEnd() {
      this.dragging = false;
      this.selectedId = null;
      this.updateScheduleChain(this.scheduleList, 0);
      this.saveOrder();
    },
    addSchedule() {
      const last = this.scheduleList[this.scheduleList.length-1];
      const newItem = {
        id: crypto.randomUUID(),
        type: 'activity',
        title: '新行程',
        start_time: last ? last.end_time : this.tripData.wakeup_time,
        duration: '01:00',
        end_time: '',
        location: '',
        transport_segments: []
      };
      this.scheduleList.push(newItem);
      this.updateScheduleChain(this.scheduleList, this.scheduleList.length-1);
      this.saveSchedule(newItem);
    },
    async saveSchedule(item) { if (this.supabaseClient) await this.supabaseClient.from('schedules').upsert(item); },
    async saveOrder() {
      this.scheduleList.forEach((item, i) => item.sort_order = i);
      if (this.supabaseClient) await this.supabaseClient.from('schedules').upsert(this.scheduleList);
    },
    autoSave() {
      if (this.supabaseClient) console.log('🌸 已自動儲存至 Supabase');
      this.saveOrder();
    },
    // 其他功能
    addShoppingItem() {
      const name = prompt('物品名稱？');
      if (name) this.shoppingList.push({ id: crypto.randomUUID(), item_name: name, is_bought: false });
    },
    async uploadVoucher(e) {
      const file = e.target.files[0];
      if (file && this.supabaseClient) {
        await this.supabaseClient.storage.from('images').upload(file.name, file);
        alert('憑證已上傳！');
      }
    },
    // Excel Engine
    exportExcel() {
      const daysList = [{dateLabel: 'Day 1'}]; // 可後續擴充多天
      const wsData = [["時間", ...daysList.map(d => d.dateLabel)]];
      const labels = [];
      for (let i = 0; i < 96; i++) {
        const h = Math.floor(i / 4);
        const m = (i % 4) * 15;
        labels.push(`\( {String(h).padStart(2,'0')}: \){String(m).padStart(2,'0')}`);
      }
      labels.forEach(l => wsData.push([l, ...new Array(daysList.length).fill('')]));
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const merges = [];
      // 填入行程合併（簡化版，實際可再細調）
      XLSX.utils.book_new();
      XLSX.writeFile(XLSX.utils.book_new(), `Our_Travel_Diary.xlsx`);
      alert('Excel 已匯出！（完整多日版本可再擴充）');
    },
  },
});
app.mount('#app');
