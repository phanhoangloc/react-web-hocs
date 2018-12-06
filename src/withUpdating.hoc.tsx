import React, { SFC, CSSProperties } from 'react'
import { compose, withProps, withState } from 'recompose'

interface IUpdateOptions {
  updates: string[]
  component: SFC<any>
  updatingStyle?: CSSProperties
}

const withUpdating = ({
  component: LoadingComponent,
  updatingStyle
}) => WrappedComponent => ({ isUpdating, ...rest }) => {
  const mergedStyle = {
    ...styles.updating,
    updatingStyle
  }

  return (
    <div style={styles.container}>
      <WrappedComponent {...rest} />
      {isUpdating && <LoadingComponent style={mergedStyle} />}
    </div>
  )
}
const styles = {
  container: {
    display: 'flex'
  },
  updating: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    display: 'flex',
    width: '100%',
    background: 'rgba(255,255,255,0.5)'
  }
}

const simulatePending = updates => props =>
  updates.reduce((acc, updatePropName) => {
    acc[updatePropName] = async (...args) => {
      try {
        props.setUpdating(true)
        const response = await props[updatePropName](...args)
        props.setUpdating(false)

        return response
      } catch (err) {
        props.setUpdating(false)
        // catch should only process errors that
        // it knows and `rethrow` all others.
        throw err
      }
    }

    return acc
  }, {})

const withUpdatingCreator = ({
  updates,
  component,
  updatingStyle
}: IUpdateOptions) =>
  compose(
    withState('isUpdating', 'setUpdating', false),
    withProps(simulatePending(updates)),
    withUpdating({
      component,
      updatingStyle
    })
  )

export { withUpdatingCreator, IUpdateOptions }
