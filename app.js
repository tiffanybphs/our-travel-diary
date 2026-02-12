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
      scheduleList: [], // 從 Supabase 載入
      dragging: false,
    };
  },
  mounted() {
    setTimeout(() => this.loading = false, 2000); // Splash 2秒
    window.addEventListener('scroll', () => this.scrolled = window.scrollY > 100);
    // 初始載入（假設已填 Supabase，若無則 UI 提示）
  },
  methods: {
    setTab(tab) { this.currentTab = tab; },
    getIcon(tab) {
      const icons = { '行程': 'fas fa-calendar', '導航': 'fas fa-map', '憑證': 'fas fa-ticket', '清單': 'fas fa-list', '記帳': 'fas fa-wallet' };
      return icons[tab];
    },
    initSupabase() {
      this.supabaseClient = supabase.createClient(this.supabaseUrl, this.anonKey, { auth: { autoRefreshToken: false, persistSession: false } });
      this.loadData();
    },
    async loadData() {
      if (!this.supabaseClient) return;
      const { data: trips } = await this.supabaseClient.from('trips').select('*').single();
      this.tripData = trips || this.tripData;
      const { data: schedules } = await this.supabaseClient.from('schedules').select('*');
      this.scheduleList = schedules || [];
    },
    // Time Engine (Part 3)
    timeToMinutes(timeStr) {
      if (!timeStr || !timeStr.includes(':')) return 0;
      const [hrs, mins] = timeStr.split(':').map(Number);
      return hrs * 60 + mins;
    },
    minutesToTime(totalMins) {
      const hrs = Math.floor(totalMins / 60) % 24;
      const mins = totalMins % 60;
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    },
    handleTimeInput(event, item, field) {
      let val = event.target.value.replace(/\D/g, '');
      if (val.length === 4) val = val.slice(0, 2) + ':' + val.slice(2);
      item[field] = val;
      const index = this.scheduleList.findIndex(i => i.id === item.id);
      this.updateScheduleChain(this.scheduleList, index);
      this.saveToSupabase(item);
    },
    updateScheduleChain(list, startIndex) {
      for (let i = startIndex; i < list.length; i++) {
        const current = list[i];
        const startMins = this.timeToMinutes(current.start_time);
        const durationMins = this.timeToMinutes(current.duration || "00:00");
        current.end_time = this.minutesToTime(startMins + durationMins);
        if (list[i + 1]) list[i + 1].start_time = current.end_time;
      }
    },
    // Drag & Drop
    onDragEnd() {
      this.dragging = false;
      this.updateScheduleChain(this.scheduleList, 0); // 骨牌式重新計算
      this.saveOrderToSupabase();
    },
    isSelected(item) { return true; }, // 簡化
    addSchedule() {
      const last = this.scheduleList[this.scheduleList.length - 1];
      const newItem = { id: crypto.randomUUID(), type: 'activity', title: '新行程', start_time: last ? last.end_time : this.tripData.wakeup_time, duration: '01:00', transport_segments: [] };
      this.scheduleList.push(newItem);
      this.updateScheduleChain(this.scheduleList, this.scheduleList.length - 1);
      this.saveToSupabase(newItem);
    },
    async saveToSupabase(item) {
      if (this.supabaseClient) await this.supabaseClient.from('schedules').upsert(item);
    },
    async saveOrderToSupabase() {
      this.scheduleList.forEach((item, idx) => item.sort_order = idx);
      if (this.supabaseClient) await this.supabaseClient.from('schedules').upsert(this.scheduleList);
    },
    async uploadImage(event) {
      const file = event.target.files[0];
      if (this.supabaseClient) {
        const { data } = await this.supabaseClient.storage.from('images').upload(file.name, file);
        // 存到 DB，如 shopping_list.image_url = data.path
      }
    },
    // Excel Engine (Part 4, 無顏色)
    timeToIndex(timeStr) {
      const [hrs, mins] = timeStr.split(':').map(Number);
      return Math.floor((hrs * 60 + mins) / 15);
    },
    generateTimeLabels() {
      const labels = [];
      for (let i = 0; i < 96; i++) {
        const h = Math.floor(i / 4);
        const m = (i % 4) * 15;
        labels.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
      return labels;
    },
    exportExcel() {
      const daysList = [{ date: '2023-02-03', dateLabel: '02.03(週二)' }]; // 從 tripData 動態推
      const wsData = [["時間", ...daysList.map(d => d.dateLabel)]];
      const timeLabels = this.generateTimeLabels();
      timeLabels.forEach(label => wsData.push([label, ...new Array(daysList.length).fill("")]));
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const merges = [];
      daysList.forEach((day, dayIdx) => {
        const colIdx = dayIdx + 1;
        const dailySchedules = this.scheduleList; // 過濾 day
        dailySchedules.forEach(item => {
          const startRow = this.timeToIndex(item.start_time) + 1;
          const endRow = this.timeToIndex(item.end_time) + 1;
          const cellAddress = XLSX.utils.encode_cell({ r: startRow, c: colIdx });
          ws[cellAddress] = { v: `${item.title}\n${item.location || ''}` };
          if (endRow > startRow) merges.push({ s: { r: startRow, c: colIdx }, e: { r: endRow - 1, c: colIdx } });
        });
      });
      ws['!merges'] = merges;
      ws['!cols'] = [{ wch: 10 }, ...new Array(daysList.length).fill({ wch: 25 })];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "旅遊行程");
      XLSX.writeFile(wb, `Our_Travel_Diary_${this.tripData.title}.xlsx`);
    },
  },
});
app.mount('#app');
