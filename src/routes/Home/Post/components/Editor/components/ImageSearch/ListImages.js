import React from 'react'
import { FixedSizeGrid } from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'

import ListImagesItem from './ListImagesItem'

const LOADING = 1
const LOADED = 2
const NUM_COLUMNS = 2
const WIDTH_SIZE = 300
const RATIO_WIDTH_TO_HEIGHT = 4 / 3
let itemStatusMap = {}

const isItemLoaded = index => !!itemStatusMap[index]
const loadMoreItems = (startIndex, stopIndex) => {
  for (let index = startIndex; index <= stopIndex; index++) {
    itemStatusMap[index] = LOADING
  }
  return new Promise(resolve => {
    for (let index = startIndex; index <= stopIndex; index++) {
      itemStatusMap[index] = LOADED
    }
    resolve()
  })
}

const ListImages = props => {
  const { images, onImageClick } = props

  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={10000}
      loadMoreItems={loadMoreItems}
    >
      {({ onItemsRendered, ref }) => (
        <FixedSizeGrid
          className="List"
          height={1000}
          width={WIDTH_SIZE}
          itemData={images}
          columnCount={2}
          columnWidth={WIDTH_SIZE / NUM_COLUMNS}
          rowCount={parseInt(images.length / NUM_COLUMNS)}
          rowHeight={WIDTH_SIZE / NUM_COLUMNS / RATIO_WIDTH_TO_HEIGHT}
          onItemsRendered={gridProps => {
            onItemsRendered({
              overscanStartIndex: gridProps.overscanRowStartIndex * NUM_COLUMNS,
              overscanStopIndex: gridProps.overscanRowStopIndex * NUM_COLUMNS,
              visibleStartIndex: gridProps.visibleRowStartIndex * NUM_COLUMNS,
              visibleStopIndex: gridProps.visibleRowStopIndex * NUM_COLUMNS
            })
          }}
          ref={ref}
        >
          {props => {
            return (
              <ListImagesItem
                {...props}
                itemStatusMap={itemStatusMap}
                numColumns={NUM_COLUMNS}
                onNextClick={onImageClick}
              />
            )
          }}
        </FixedSizeGrid>
      )}
    </InfiniteLoader>
  )
}

export default ListImages
