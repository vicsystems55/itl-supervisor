// navigation.js
import { ref } from 'vue'

const menu = ref([])
const loading = ref(true)

// Simulate loader (replace with real async role check if needed)
setTimeout(() => {
  // Get user data from session storage
  const userData = JSON.parse(sessionStorage.getItem('user') || '{}')
  const role = userData.role || localStorage.getItem('role') || ''

  // ===== Super Admin =====
  if (role === 'Super Admin') {
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

      { heading: 'Reports & Compliance' },
      {
        title: 'Reports & Annexes',
        icon: { icon: 'tabler-report-analytics' },
        children: [
          { title: 'Project Reports', to: { name: 'project-reports' } },
          { title: 'Annex Forms', to: { name: 'annex-forms' } },
          { title: 'OAS Upload / Export', to: { name: 'oas-upload' } },
        ],
      },

      { heading: 'Settings & Administration' },
      {
        title: 'System Settings',
        icon: { icon: 'tabler-settings' },
        children: [
          { title: 'User Accounts', to: { name: 'accounts' } },
          { title: 'Notifications', to: { name: 'notifications' } },
          { title: 'Authorization', to: { name: 'authorization' } },
          { title: 'Database', to: { name: 'upload-database' } },
        ],
      },
    ]
  } 
  // ===== Technician =====
  else if (role === 'Technician Lead') {
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
  // ===== Default (no role found or other roles) =====
  else {
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

      { heading: 'Reports & Compliance' },
      {
        title: 'Reports & Annexes',
        icon: { icon: 'tabler-report-analytics' },
        children: [
          { title: 'Project Reports', to: { name: 'project-reports' } },
          { title: 'Annex Forms', to: { name: 'annex-forms' } },
          { title: 'OAS Upload / Export', to: { name: 'oas-upload' } },
        ],
      },

      { heading: 'Settings & Administration' },
      {
        title: 'System Settings',
        icon: { icon: 'tabler-settings' },
        children: [
          { title: 'User Accounts', to: { name: 'accounts' } },
          { title: 'Notifications', to: { name: 'notifications' } },
          { title: 'Authorization', to: { name: 'authorization' } },
          { title: 'Database', to: { name: 'upload-database' } },
        ],
      },
    ]
  }

  loading.value = false
}, 1000)

// Export menu as default (used by layouts) and export loading namedly
export { loading }
export default menu
