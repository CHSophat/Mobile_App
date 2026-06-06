/**
 * Endpoints that match the .NET Apartement_Service controllers as actually implemented.
 * Use this in new code. The legacy `endpoints` map below has many paths that the
 * backend hasn't built yet — kept only so existing imports still resolve.
 */
export const endpointsV2 = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
    sessions: '/auth/sessions',
    revokeSession: (sessionId: string | number) => `/auth/sessions/${sessionId}`,
    verifyEmail: '/auth/verify-email',
    forgotPassword: '/auth/password/forgot',
    resetPassword: '/auth/password/reset',
    otpRequest: '/auth/otp/request',
    otpVerify: '/auth/otp/verify',
    enable2fa: '/auth/2fa/enable',
    verify2fa: '/auth/2fa/verify',
    login2fa: '/auth/2fa/login',
    ssoGoogle: '/auth/sso/google',
  },
  products: {
    units: '/products/units',
    available: '/products/units/available',
    search: '/products/search',
    bulkStatus: '/products/bulk-status',
    create: '/products',
    byId: (id: string | number) => `/products/${id}`,
    setStatus: (id: string | number) => `/products/${id}/status`,
    setMaintenance: (id: string | number) => `/products/${id}/maintenance`,
    maintenanceRequests: (id: string | number) => `/products/${id}/maintenance-requests`,
    paymentBreakdown: (id: string | number) => `/products/${id}/payment-breakdown`,
    photos: (id: string | number) => `/products/${id}/photos`,
    byProperty: '/products/by-property',
  },
  customers: {
    profile: (customerId: string | number) => `/customers/${customerId}/profile`,
    createTenant: '/customers/tenant',
    update: (customerId: string | number) => `/customers/${customerId}`,
    addresses: (customerId: string | number) => `/customers/${customerId}/addresses`,
    addressById: (addressId: string | number) => `/customers/addresses/${addressId}`,
    setPrimaryAddress: (addressId: string | number) =>
      `/customers/addresses/${addressId}/set-primary`,
    leaseHistory: (customerId: string | number) => `/customers/${customerId}/leases/history`,
    leaseDocuments: (leaseId: string | number) => `/customers/leases/${leaseId}/documents`,
    signLease: (leaseId: string | number) => `/customers/leases/${leaseId}/sign`,
    notes: (customerId: string | number) => `/customers/${customerId}/notes`,
    noteById: (noteId: string | number) => `/customers/notes/${noteId}`,
    communications: (customerId: string | number) =>
      `/customers/${customerId}/communications`,
    moveInChecklist: (leaseId: string | number) =>
      `/customers/leases/${leaseId}/move-in-checklist`,
    checklistById: (checklistId: string | number) => `/customers/checklists/${checklistId}`,
    search: '/customers/search',
    tenants: '/customers/tenants',
    activeTenantsByProperty: (propertyId: string | number) =>
      `/customers/properties/${propertyId}/tenants/active`,
    ownerPortfolio: (ownerId: string | number) => `/customers/owners/${ownerId}/portfolio`,
  },

  // ===== Tenant App scope (catalog gaps now backed by Apartement_Service) =====

  // Mirrors the "Invoices (Shared)" controller in Apartement_Service.
  invoices: {
    list: '/invoices',
    create: '/invoices',
    byId: (id: string | number) => `/invoices/${id}`,
    update: (id: string | number) => `/invoices/${id}`,
    delete: (id: string | number) => `/invoices/${id}`,
    send: (id: string | number) => `/invoices/${id}/send`,
    void: (id: string | number) => `/invoices/${id}/void`,
    pdf: (id: string | number) => `/invoices/${id}/pdf`,
    outstanding: '/invoices/outstanding',
  },

  // Mirrors the "Payments (Shared)" controller in Apartement_Service.
  payments: {
    list: '/payments',
    create: '/payments',
    unmatched: '/payments/unmatched',
    match: (id: string | number) => `/payments/${id}/match`,
    deleteMatch: (matchId: string | number) => `/payments/matches/${matchId}`,
    byId: (id: string | number) => `/payments/${id}`,
    history: '/payments/history',
    methods: '/payments/methods',
    methodById: (id: string | number) => `/payments/methods/${id}`,
    bakongQr: '/payments/bakong-qr',
    bakongWebhook: '/payments/bakong/webhook',
    confirm: (id: string | number) => `/payments/${id}/confirm`,
    cancel: (id: string | number) => `/payments/${id}/cancel`,
    receipt: (id: string | number) => `/payments/${id}/receipt`,
  },

  // Mirrors the "Maintenance (Shared)" controller in Apartement_Service.
  maintenance: {
    requests: '/maintenance/requests',
    requestById: (id: string | number) => `/maintenance/requests/${id}`,
    requestStatus: (id: string | number) => `/maintenance/requests/${id}/status`,
    requestAssign: (id: string | number) => `/maintenance/requests/${id}/assign`,
    requestPhotos: (id: string | number) => `/maintenance/requests/${id}/photos`,
    vendors: '/maintenance/vendors',
    slaSummary: '/maintenance/sla-summary',
  },

  // Mirrors the "Messaging (Shared)" controller in Apartement_Service.
  conversations: {
    list: '/conversations',
    create: '/conversations',
    byId: (id: string | number) => `/conversations/${id}`,
    messages: (id: string | number) => `/conversations/${id}/messages`,
    read: (id: string | number) => `/conversations/${id}/read`,
    /** Realtime message stream (WebSocket). Not under /api/v1. */
    ws: '/ws/messages',
  },

  // Mirrors the "Announcements (Shared)" controller in Apartement_Service.
  announcements: {
    list: '/announcements',
    create: '/announcements',
    byId: (id: string | number) => `/announcements/${id}`,
    sendNow: (id: string | number) => `/announcements/${id}/send-now`,
    deliveries: (id: string | number) => `/announcements/${id}/deliveries`,
    coverUpload: '/announcements/cover/upload',
  },

  notifications: {
    list: '/notifications',
    unreadCount: '/notifications/unread-count',
    markRead: (id: string | number) => `/notifications/${id}/read`,
    markAllRead: '/notifications/mark-all-read',
    pushDevices: '/push/devices',
    pushDeviceByToken: (token: string) => `/push/devices/${encodeURIComponent(token)}`,
    prefs: '/notification-prefs',
  },

  // Mirrors the "Leases (Shared)" controller in Apartement_Service.
  leases: {
    byId: (id: string | number) => `/leases/${id}`,
    status: (id: string | number) => `/leases/${id}/status`,
    sendForSignature: (id: string | number) => `/leases/${id}/send-for-signature`,
    sign: (id: string | number) => `/leases/${id}/sign`,
    renew: (id: string | number) => `/leases/${id}/renew`,
    terminate: (id: string | number) => `/leases/${id}/terminate`,
    documents: (id: string | number) => `/leases/${id}/documents`,
  },

  uploads: {
    profilePhoto: '/uploads/profile-photo',
    maintenancePhoto: '/uploads/maintenance-photo',
    document: '/uploads/document',
  },

  health: {
    status: '/health/status',
    ready: '/health/ready',
    live: '/health/live',
  },
};

/**
 * Legacy endpoint map. Not all of these exist on the backend.
 * Prefer `endpointsV2` for new code.
 */
export const endpoints = {
  // Auth
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    verify2FA: '/auth/verify-2fa',
    resendOTP: '/auth/resend-otp',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    validateToken: '/auth/validate-token',
    googleLogin: '/auth/google',
    facebookLogin: '/auth/facebook',
  },

  // Users
  users: {
    profile: '/users/profile',
    updateProfile: '/users/profile',
    uploadAvatar: '/users/profile/avatar',
    documents: '/users/documents',
    addresses: '/users/addresses',
    preferences: '/users/preferences',
    activityLog: '/users/activity-log',
    getById: (id: string) => `/users/${id}`,
  },

  // Properties
  properties: {
    list: '/properties',
    search: '/properties/search',
    create: '/properties',
    statistics: '/properties/statistics',
    getById: (id: string) => `/properties/${id}`,
    update: (id: string) => `/properties/${id}`,
    delete: (id: string) => `/properties/${id}`,
    getUnits: (id: string) => `/properties/${id}/units`,
    getImages: (id: string) => `/properties/${id}/images`,
  },

  // Units
  units: {
    list: '/units',
    search: '/units/search',
    create: '/units',
    getById: (id: string) => `/units/${id}`,
    update: (id: string) => `/units/${id}`,
    delete: (id: string) => `/units/${id}`,
    getImages: (id: string) => `/units/${id}/images`,
    getTenants: (id: string) => `/units/${id}/tenants`,
    getLeases: (id: string) => `/units/${id}/leases`,
  },

  // Leases
  leases: {
    list: '/leases',
    create: '/leases',
    active: '/leases/active',
    expiring: '/leases/expiring',
    getById: (id: string) => `/leases/${id}`,
    update: (id: string) => `/leases/${id}`,
    delete: (id: string) => `/leases/${id}`,
    renew: (id: string) => `/leases/${id}/renew`,
    getDocuments: (id: string) => `/leases/${id}/documents`,
    terminate: (id: string) => `/leases/${id}/terminate`,
  },

  // Payments
  payments: {
    list: '/payments',
    create: '/payments',
    history: '/payments/history',
    methods: '/payments/methods',
    bakongQR: '/payments/bakong-qr',
    invoice: '/payments/invoice',
    statistics: '/payments/statistics',
    outstanding: '/payments/outstanding',
    getById: (id: string) => `/payments/${id}`,
    confirm: (id: string) => `/payments/${id}/confirm`,
    cancel: (id: string) => `/payments/${id}/cancel`,
    getReceipt: (id: string) => `/payments/${id}/receipt`,
  },

  // Maintenance
  maintenance: {
    // Requests
    requestList: '/maintenance/requests',
    requestCreate: '/maintenance/requests',
    myRequests: '/maintenance/requests/my-requests',
    requestGetById: (id: string) => `/maintenance/requests/${id}`,
    requestUpdate: (id: string) => `/maintenance/requests/${id}`,
    requestDelete: (id: string) => `/maintenance/requests/${id}`,
    requestAssign: (id: string) => `/maintenance/requests/${id}/assign`,
    
    // Tickets
    ticketList: '/maintenance/tickets',
    ticketCreate: '/maintenance/tickets',
    ticketGetById: (id: string) => `/maintenance/tickets/${id}`,
    ticketUpdate: (id: string) => `/maintenance/tickets/${id}`,
    ticketClose: (id: string) => `/maintenance/tickets/${id}/close`,
    
    // Schedule & Technicians
    schedule: '/maintenance/schedule',
    technicians: '/maintenance/technicians',
  },

  // Communication
  communication: {
    // Conversations
    conversationList: '/communication/conversations',
    conversationCreate: '/communication/conversations',
    conversationGetById: (id: string) => `/communication/conversations/${id}`,
    conversationMessages: (id: string) => `/communication/conversations/${id}/messages`,
    sendMessage: (id: string) => `/communication/conversations/${id}/messages`,
    
    // Notifications
    notificationList: '/communication/notifications',
    unreadCount: '/communication/notifications/unread-count',
    markAsRead: (id: string) => `/communication/notifications/${id}/read`,
    markAsUnread: (id: string) => `/communication/notifications/${id}/unread`,
    markAllAsRead: '/communication/notifications/mark-all-read',
    
    // Announcements
    announcementList: '/communication/announcements',
    getAnnouncement: (id: string) => `/communication/announcements/${id}`,
  },

  // Dashboard
  dashboard: {
    tenantStats: '/dashboard/tenant/stats',
    ownerStats: '/dashboard/owner/stats',
    adminStats: '/dashboard/admin/stats',
    propertyOverview: '/dashboard/property-overview',
    revenueAnalytics: '/dashboard/revenue-analytics',
    occupancyRate: '/dashboard/occupancy-rate',
  },

  // Admin
  admin: {
    userManagement: '/admin/users',
    propertyManagement: '/admin/properties',
    reports: '/admin/reports',
    auditLogs: '/admin/audit-logs',
    systemSettings: '/admin/system-settings',
    getReport: (reportType: string) => `/admin/reports?type=${reportType}`,
  },

  // Uploads
  uploads: {
    profileImage: '/uploads/profile-image',
    propertyImage: '/uploads/property-image',
    document: '/uploads/document',
    video: '/uploads/video',
  },

  // Health
  health: {
    status: '/health/status',
    ready: '/health/ready',
    live: '/health/live',
  },
};
