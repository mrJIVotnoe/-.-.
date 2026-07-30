// ========================================================
// JIV FLEET VLADIVOSTOK - WECHAT MINI APP INDEX.JS
// ========================================================

const app = getApp();

Page({
  data: {
    webviewUrl: ''
  },

  onLoad: function (options) {
    const baseUrl = app.globalData.serverUrl || 'https://fleet.your-domain.ru';
    let targetUrl = baseUrl + '?lang=zh&channel=wechat_miniprogram';

    // Append openid if available
    if (app.globalData.openid) {
      targetUrl += '&wx_openid=' + encodeURIComponent(app.globalData.openid);
    }

    // Handle deep links passed from WeChat QR code or start parameters
    if (options && options.section) {
      targetUrl += '&section=' + encodeURIComponent(options.section);
    }

    this.setData({
      webviewUrl: targetUrl
    });

    console.log('⚓ Webview URL set to:', targetUrl);
  },

  // Listen for messages sent from web app via wx.miniProgram.postMessage
  onWebviewMessage: function (e) {
    console.log('📬 Message received from Webview:', e.detail.data);
  },

  // Enable WeChat sharing (微信分享卡片)
  onShareAppMessage: function () {
    return {
      title: 'ФАРВАТЕР 符拉迪沃斯托克 JIV 舰队 - 游艇租赁 & 海上出租车',
      path: '/pages/index/index',
      imageUrl: 'https://fleet.your-domain.ru/assets/wechat_share_cover.png'
    };
  }
});
