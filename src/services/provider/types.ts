export interface SiteSocialResponse<T = any> {
  status: number; // 1 = success, 0 = failure
  msg?: string;
  order_id?: number | string;
  original?: number;
  data?: T;
}

export interface SiteSocialBalanceResponse {
  status: number;
  balance?: number;
  email?: string;
  username?: string;
  msg?: string;
}

export interface SiteSocialPriceItem {
  id: number | string;
  name: string;
  server: string;
  price: number;
  min: number;
  max: number;
  type: string;
  note?: string;
}

export interface CreateOrderPayload {
  token: string;
  service_endpoint: string; // e.g. /tiktok/like_tiktok, /facebook/follow, /youtube/view_youtube
  params: {
    link?: string;
    url?: string;
    uid?: string;
    name?: string;
    server?: string;
    count?: number;
    reaction?: string;
    speed?: string | number;
    comments?: string;
    list_comment?: string;
    note?: string;
    minute?: number;
    days?: number;
    vip_package?: number;
    max_post?: number;
    [key: string]: any;
  };
}
