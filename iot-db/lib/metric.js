'use strict'

module.exports = (MetricModel, AgentModel) => {
  async function create (agentUuid, metric) {
    const agent = await AgentModel.findOne({
      where: { uuid:  agentUuid }
    })

    if (agent) {
      console.log('TCL: create -> agent', agent);
      Object.assign(metric, { agentId: agent.id })
      const result = await MetricModel.create(metric)
      return result.toJSON()
    }
  }

  async function findbyAgentUuid (uuid) {
    return MetricModel.findAll({
      attributes: [ 'type' ],
      group: [ 'type' ],
      include: [{
        attributes: [],
        model: AgentModel,
        where: {
          uuid
        }
      }],
      raw: true
    })
  }

  async function findByTypeAgentUuid (type, uuid) {
    return MetricModel.findAll({
      attributes: [ 'id', 'type', 'value', 'createdAt' ],
      where: {
        type
      },
      limit: 20,
      order: [[ 'createdAt', 'DESC' ]],
      include: [{
        attributes: [],
        model: AgentModel,
        where: {
          uuid
        }
      }],
      raw: true
    })
  }

  return {
    create,
    findbyAgentUuid,
    findByTypeAgentUuid
  }
}
