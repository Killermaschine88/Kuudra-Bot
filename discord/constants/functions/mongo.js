async function findOne(id) {
    const user = await dclient.collection.find({ "discord.id": id })
    return user ? user : null
}

module.exports = { findOne }