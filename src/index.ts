import './app';
// 热加载
if (module.hot) {
  // 监听./app.ts
  module.hot.accept();
}
