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
      dragging: false,
      selectedId: null,
    };
  },
  mounted() {
    setTimeout(() => this.loading = false, 1800);
    window.addEventListener('scroll', () => this.scrolled = window.scrollY > 120);
  },
  methods: {
    setTab(tab) { this.currentTab = tab; },
    getIcon(tab) {
      const map = { '行程': 'fas fa-calendar-day', '導航': 'fas fa-map-marked-alt', '憑證': 'fas fa-ticket-alt', '清單': 'fas fa-list-ul', '記帳': 'fas fa-yen-sign' };
      return map[tab];
    },
    initSupabase() {
      this.supabaseClient = supabase.createClient(this.supabaseUrl, this.anonKey);
      this.loadData();
      setInterval(() => this.autoSave(), 600000);
    },
    async loadData() {
      if (!this.supabaseClient) return;
      const { data } = await this.supabaseClient.from('schedules').select('*').order('sort_order');
      this.scheduleList = data || [];
    },
    // Time Engine（徹底修正）
    timeToMinutes(t) {
      if (!t || !t.includes(':')) return 0;
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    },
    minutesToTime(total) {
      const h = Math.floor(total / 60) % 24;
      const m = total % 60;
      return `\( {String(h).padStart(2, '0')}: \){String(m).padStart(2, '0')}`;
    },
    handleTimeInput(e, item, field) {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length === 4) val = val.slice(0, 2) + ':' + val.slice(2);
      item[field] = val;
      const idx = this.scheduleList.findIndex(i => i.id === item.id);
      this.updateScheduleChain(this.scheduleList, idx);
      this.saveSchedule(item);
    },
    updateScheduleChain(list, startIdx) {
      for (let i = startIdx; i < list.length; i++) {
        const cur = list[i];
        const startM = this.timeToMinutes(cur.start_time);
        const durM = this.timeToMinutes(cur.duration || '00:00');
        cur.end_time = this.minutesToTime(startM + durM);
        if (list[i + 1]) list[i + 1].start_time = cur.end_time;
      }
    },
    getTransportTitle(item) {
      if (!item.transport_segments || item.transport_segments.length === 0) return item.title || '交通';
      const s = item.transport_segments;
      return `${s[0].from_station || ''} ➜ ${s[s.length-1].to_station || ''}`;
    },
    // Drag & Drop
    onDragStart(e) {
      this.dragging = true;
      this.selectedId = e.item._underlying_vm_.id;
    },
    onDragEnd() {
      this.dragging = false;
      this.selectedId = null;
      this.updateScheduleChain(this.scheduleList, 0);
      this.saveOrder();
    },
    addSchedule() {
      const last = this.scheduleList[this.scheduleList.length - 1];
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
      this.updateScheduleChain(this.scheduleList, this.scheduleList.length - 1);
      this.saveSchedule(newItem);
    },
    async saveSchedule(item) {
      if (this.supabaseClient) await this.supabaseClient.from('schedules').upsert(item);
    },
    async saveOrder() {
      this.scheduleList.forEach((item, i) => item.sort_order = i);
      if (this.supabaseClient) await this.supabaseClient.from('schedules').upsert(this.scheduleList);
    },
    autoSave() { this.saveOrder(); },
    // 其他
    async uploadVoucher(e) { /* ... */ },
    exportExcel() { /* ... */ },
  },
});
app.mount('#app');
