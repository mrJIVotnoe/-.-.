// ========================================================
// JIV FLEET VLADIVOSTOK - WECHAT MINI APP APP.JS (微信小程序)
// ========================================================

App({
  globalData: {
    userInfo: null,
    openid: null,
    sessionKey: null,
    serverUrl: 'https://fleet.your-domain.ru' // Replace with your production domain
  },

  onLaunch: function () {
    console.log('⚓ JIV Fleet Vladivostok WeChat Mini App Launched');
    this.checkLogin();
  },

  // Perform wx.login() to obtain code for code2session exchange
  checkLogin: function () {
    const that = this;
    wx.login({
      success: function (res) {
        if (res.code) {
          console.log('✓ WeChat Login code obtained:', res.code);
          // Request openid exchange from backend
          wx.request({
            url: that.globalData.serverUrl + '/api/wechat/auth/code2session',
            method: 'POST',
            data: { code: res.code },
            success: function (sessionRes) {
              if (sessionRes.data && sessionRes.data.openid) {
                that.globalData.openid = sessionRes.data.openid;
                console.log('✓ WeChat openid stored:', sessionRes.data.openid);
              }
            },
            fail: function (err) {
              console.warn('⚠️ code2session request skipped (dev mode):', err);
            }
          });
        }
      }
    });
  }
});
