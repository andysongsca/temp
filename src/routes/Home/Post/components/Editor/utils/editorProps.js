import React from 'react'
import { DefaultDraftBlockRenderMap } from 'draft-js'
import { Map } from 'immutable'

const extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(
  Map({
    'subtitle-2': {
      wrapper: <p style={{ fontSize: '24px', fontWeight: 'bold' }} />
    },
    'subtitle-1': {
      element: 'p',
      wrapper: <p style={{ fontSize: '28px', fontWeight: 'bold' }} />
    }
  })
)

export const blockRenderMap = extendedBlockRenderMap
