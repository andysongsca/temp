export const createDecorator = (typeName, component) => {
  function findEntities(contentBlock, callback, contentState) {
    contentBlock.findEntityRanges(
      (character) => {
        const entityKey = character.getEntity()
      
        return (
          entityKey !== null &&
          contentState.getEntity(entityKey).getType() === typeName
        )
      },
      callback
    )
  }

  return {
    strategy: findEntities,
    component: component,
  }
}