// navigation.js
import { ref } from 'vue'

const menu = ref([])
const loading = ref(true)

// Simulate loader (replace with real async role check if needed)
setTimeout(() => {
  const role = localStorage.getItem('role')

  // ===== Admin / Default (no role found) =====
  if (!role || role === '') {
    menu.value = [
      { heading: 'Main Navigation' },
      {
        title: 'Dashboard',
        icon: { icon: 'tabler-layout-dashboard' },
        to: { path: '/' },
      },

      { heading: 'Distribution & Logistics' },
      {
        title: 'Shipments & Deliveries',
        icon: { icon: 'tabler-truck' },
        children: [
          { title: 'All Shipments', to: { name: 'all-shipment' } },
          { title: 'Delivery Receipts', to: { name: 'delivery-receipts' } },
          { title: 'Tracking Map', to: { name: 'tracking-map' } },
        ],
      },
      {
        title: 'Assets & Fleet',
        icon: { icon: 'tabler-building-warehouse' },
        children: [
          { title: 'Warehouses', to: { name: 'warehouses' } },
          { title: 'Vehicles & Drivers', to: { name: 'vehicles-drivers' } },
       
        ],
      },

      { heading: 'Installation & Commissioning' },
      {
        title: 'Installations',
        icon: { icon: 'tabler-tools' },
        children: [
          { title: 'Installation List', to: { name: 'installation' } },
          { title: 'Installation Photos', to: { name: 'installation-photos' } },
          { title: 'Pre-commissioning Reports', to: { name: 'precommissioning-report' } },
        ],
      },
      {
        title: 'Teams & Technicians',
        icon: { icon: 'tabler-users-group' },
        children: [
          { title: 'Technicians Overview', to: { name: 'technicians' } },
      
        ],
      },

      // { heading: 'Training & Readiness' },
      // {
      //   title: 'Training Management',
      //   icon: { icon: 'tabler-chalkboard' },
      //   children: [
      //     { title: 'Site Readiness', to: { path: '/' } },
      //     { title: 'Training Sessions', to: { path: '/' } },
      //     { title: 'Attendance Records', to: { path: '/' } },
      //   ],
      // },

      // { heading: 'After-Sales & Maintenance' },
      // {
      //   title: 'Maintenance Operations',
      //   icon: { icon: 'tabler-wrench' },
      //   children: [
      //     { title: 'Maintenance Requests', to: { path: '/' } },
      //     { title: 'Spare Parts Inventory', to: { path: '/' } },
      //     { title: 'Service Logs', to: { path: '/' } },
      //   ],
      // },

      { heading: 'Reports & Compliance' },
      {
        title: 'Reports & Annexes',
        icon: { icon: 'tabler-report-analytics' },
        children: [
          { title: 'Project Reports', to: { name: 'project-reports' } },
          { title: 'Annex Forms', to: { path: '/' } },
          { title: 'OAS Upload / Export', to: { path: '/' } },
        ],
      },

      { heading: 'Settings & Administration' },
      {
        title: 'System Settings',
        icon: { icon: 'tabler-settings' },
        children: [
          { title: 'User Accounts', to: { path: '/' } },
          { title: 'Notifications', to: { path: '/' } },
          { title: 'Configuration', to: { path: '/' } },
        ],
      },
    ]
  } else {
    // ===== Field Users (Driver, Technician, etc.) =====
    menu.value = [
      { heading: 'Quick Access' },
      {
        title: 'Home',
        icon: { icon: 'tabler-home' },
        to: { path: '/' },
      },
      {
        title: 'Reports',
        icon: { icon: 'tabler-report' },
        children: [
          { title: 'My Deliveries', to: { path: '/' } },
          { title: 'My Installations', to: { path: '/' } },
        ],
      },
      {
        title: 'Profile',
        icon: { icon: 'tabler-user' },
        to: { path: '/' },
      },
    ]
  }

  loading.value = false
}, 1000)

// Export menu as default (used by layouts) and export loading namedly
export { loading }
export default menu
