(function () {
  document.addEventListener("click", (e) => {
    const { clicker } = e.target.dataset;
    if (!clicker) {
      return;
    }
    document.querySelector(clicker)?.click();
  });
})();