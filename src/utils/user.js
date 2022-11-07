export const setAccountId = (accountId) => {
  window.sessionStorage.setItem("account", accountId)
}

export const getAccountId = () => {
  return window.sessionStorage.getItem("account") || 0
}
