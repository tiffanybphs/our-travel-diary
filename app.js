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
      tripData: { title: '我的日本之旅', start_date: '2025/02/01', end_date: '2025/02/10', wakeup_time: '09:00', sleep_time: '22:00' },
      days: [], // 會動態產生
      currentDayIndex: 0,
      scheduleList: [], // 所有行程
      pendingSchedules: [],
      dragging: false,
      selectedId: null,
      showAddModal: false,
      editingItem: null,
      editingType: 'activity'
    };
  },
  computed: {
    currentDaySchedules() {
      const currentDay = this.days[this.currentDayIndex];
      return this.scheduleList.filter(s => s.day_date === currentDay.date);
    }
  },
  mounted() {
    setTimeout(() => this.loading = false, 1800);
    window.addEventListener('scroll', () => this.scrolled = window.scrollY > 100);
    this.generateDays();
  },
  methods: {
    generateDays() {
      this.days = [
        { date: '2025-02-01', label: '02.01(六)' },
        { date: '2025-02-02', label: '02.02(日)' },
        { date: '2025-02-03', label: '02.03(一)' },
        { date: '2025-02-04', label: '02.04(二)' },
        { date: '2025-02-05', label: '02.05(三)' }
      ];
    },
    setTab(tab) { this.currentTab = tab; },
    getIcon(tab) {
      const map = { '行程': 'fas fa-calendar-day', '導航': 'fas fa-map-marked-alt', '憑證': 'fas fa-ticket-alt', '清單': 'fas fa-list-ul', '記帳': 'fas fa-yen-sign' };
      return map[tab];
    },
    initSupabase() {
      this.supabaseClient = supabase.createClient(this.supabaseUrl, this.anonKey);
      this.loadData();
    },
    async loadData() {
      if (!this.supabaseClient) return;
      const { data } = await this.supabaseClient.from('schedules').select('*');
      this.scheduleList = data || [];
    },
    getMapUrl(location) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    },
    getTransportTitle(item) {
      if (!item.transport_segments || item.transport_segments.length === 0) return item.title;
      const s = item.transport_segments;
      return `${s[0].from_station} ➜ ${s[s.length-1].to_station}`;
    },
    handleTimeInput(e, item) {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length === 4) val = val.slice(0, 2) + ':' + val.slice(2);
      item[e.target.name || 'start_time'] = val; // 簡化
      this.updateScheduleChain(item);
    },
    updateScheduleChain(item) {
      const daySchedules = this.currentDaySchedules;
      const idx = daySchedules.findIndex(i => i.id === item.id);
      for (let i = idx; i < daySchedules.length; i++) {
        const cur = daySchedules[i];
        const startM = this.timeToMinutes(cur.start_time);
        const durM = this.timeToMinutes(cur.duration || '00:00');
        cur.end_time = this.minutesToTime(startM + durM);
        if (daySchedules[i + 1]) daySchedules[i + 1].start_time = cur.end_time;
      }
    },
    timeToMinutes(t) { if (!t) return 0; const [h, m] = t.split(':').map(Number); return h*60 + m; },
    minutesToTime(total) { const h = Math.floor(total/60)%24; return `\( {String(h).padStart(2,'0')}: \){String(total%60).padStart(2,'0')}`; },
    onDragStart(e) { this.dragging = true; this.selectedId = e.item._underlying_vm_.id; },
    onDragEnd() {
      this.dragging = false;
      this.selectedId = null;
      this.updateScheduleChain(this.currentDaySchedules[0]);
    },
    moveToDay(e) {
      // 將 pending 移動到當日
      const item = e.item._underlying_vm_;
      item.day_date = this.days[this.currentDayIndex].date;
      this.scheduleList.push(item);
      this.pendingSchedules = this.pendingSchedules.filter(i => i.id !== item.id);
    },
    showAddModal: false,
    addSchedule(type) {
      this.editingType = type;
      this.editingItem = { id: crypto.randomUUID(), type, day_date: this.days[this.currentDayIndex].date, title: '', start_time: '', duration: '01:00', transport_segments: [] };
      this.showAddModal = true;
    },
    saveEditedItem() {
      if (this.editingItem) {
        this.scheduleList.push(this.editingItem);
        this.updateScheduleChain(this.editingItem);
      }
      this.cancelEdit();
    },
    cancelEdit() {
      this.showAddModal = false;
      this.editingItem = null;
    },
    editItem(item) {
      this.editingItem = { ...item };
      this.showAddModal = true;
    },
    exportExcel() { /* Part 4 邏輯 */ alert('Excel 已匯出'); },
    uploadVoucher() { /* ... */ }
  }
});
app.mount('#app');
