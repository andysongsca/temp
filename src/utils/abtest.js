import { parseQuery } from 'hocs/withQuery'
/* abtest utility
  name - string representing the test; can only be alphanumeric and _
  variations - array of variation keys
*/
export default (name, variations) => {
  // first, check url parameter
  const query = parseQuery(window.location)
  const option = query[name]
  if (option && variations.indexOf(option) > -1) {
    return option
  }
  // check variation name stored in local storage
  const testName = 'nb_vars_' + name
  const curVar = window.localStorage.getItem(testName)
  if (curVar && variations.indexOf(curVar) > -1) {
    return curVar
  }
  // randomly assign variation
  const index = Math.min(Math.floor(Math.random() * variations.length), variations.length - 1)
  window.localStorage.setItem(testName, variations[index]);
  return variations[index]
}