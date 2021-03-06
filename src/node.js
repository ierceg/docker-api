'use strict'

/**
 * Class representing a node
 */
class Node {
  /**
   * Create a node
   * @param  {Modem}      modem     Modem to connect to the remote service
   * @param  {string}     id        Id of the node (optional)
   */
  constructor (modem, id) {
    this.modem = modem
    this.id = id
  }

  /**
   * Get the list of nodes
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/list-nodes
   * @param  {Object}   opts  Query params in the request (optional)
   * @return {Promise}        Promise returning the result as a list of nodes
   */
  list (opts) {
    const call = {
      path: '/nodes?',
      method: 'GET',
      options: opts,
      statusCodes: {
        200: true,
        500: 'server error'
      }
    }

    return new Promise((resolve, reject) => {
      this.modem.dial(call, (err, result) => {
        if (err) return reject(err)
        if (!result || !result.length) return resolve([])
        resolve(result.map((conf) => {
          const node = new Node(this.modem, conf.ID)
          return Object.assign(node, conf)
        }))
      })
    })
  }

  /**
   * Update a node
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/update-a-node
   * @param  {Object}   opts  Query params in the request (optional)
   * @param  {String}   id    ID of the node to inspect, if it's not set, use the id of the object (optional)
   * @return {Promise}        Promise return the new node
   */
  update (opts, id) {
    [ opts, id ] = this.__processArguments(opts, id)

    const call = {
      path: `/nodes/${id}/update?`,
      method: 'POST',
      options: opts,
      statusCodes: {
        200: true,
        404: 'no such node',
        500: 'server error'
      }
    }

    return new Promise((resolve, reject) => {
      this.modem.dial(call, (err, conf) => {
        if (err) return reject(err)
        const node = new Node(this.modem, id)
        resolve(Object.assign(node, conf))
      })
    })
  }

  /**
   * Get low-level information on a node
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/inspect-a-node
   * The reason why this module isn't called inspect is because that interferes with the inspect utility of node.
   * @param  {Object}   opts  Query params in the request (optional)
   * @param  {String}   id    ID of the node to inspect, if it's not set, use the id of the object (optional)
   * @return {Promise}        Promise return the node
   */
  status (opts, id) {
    [ opts, id ] = this.__processArguments(opts, id)

    const call = {
      path: `/nodes/${id}?`,
      method: 'GET',
      options: opts,
      statusCodes: {
        200: true,
        404: 'no such node',
        500: 'server error'
      }
    }

    return new Promise((resolve, reject) => {
      this.modem.dial(call, (err, conf) => {
        if (err) return reject(err)
        const node = new Node(this.modem, id)
        resolve(Object.assign(node, conf))
      })
    })
  }

  /**
   * Remove a node
   * https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/#/remove-a-node
   * @param  {Object}   opts  Query params in the request (optional)
   * @param  {String}   id    ID of the node to inspect, if it's not set, use the id of the object (optional)
   * @return {Promise}        Promise return the result
   */
  remove (opts, id) {
    [ opts, id ] = this.__processArguments(opts, id)
    const call = {
      path: `/nodes/${id}?`,
      method: 'DELETE',
      options: opts,
      statusCodes: {
        204: true,
        404: 'no such node',
        500: 'server error'
      }
    }

    return new Promise((resolve, reject) => {
      this.modem.dial(call, (err, res) => {
        if (err) return reject(err)
        resolve(res)
      })
    })
  }

  __processArguments (opts, id) {
    if (typeof opts === "string" && !id) {
      id = opts
    }
    if (!id && this.id) {
      id = this.id
    }
    if (!opts) opts = {}
    return [ opts, id ]
  }
}

export default Node
