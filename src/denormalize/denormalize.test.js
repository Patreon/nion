import {
    EntityStoreManager,
    makeUserEntity,
    makeFriendEntity,
    makeFriendsEntity,
} from './test.helpers'
import denormalize from './index'
import cache from './cache'

describe('nion/denormalize', () => {
    describe('simple denormalization', () => {
        it('an empty ref returns an empty array', () => {
            const entityStoreManager = new EntityStoreManager()
            const ref = { entities: [] }
            const object = denormalize(ref, entityStoreManager.store)
            expect(object.length).toEqual(0)
        })

        it('an undefined ref returns undefined', () => {
            const entityStoreManager = new EntityStoreManager()
            const ref = { entities: [undefined] }
            const [object] = denormalize(ref, entityStoreManager.store)
            expect(object).toEqual(undefined)
        })

        it('simple entity with no relationships is denormalized', () => {
            const entityStoreManager = new EntityStoreManager()
            const userEntity = makeUserEntity()
            entityStoreManager.addEntity(userEntity)

            const { type, id } = userEntity
            const ref = { entities: [{ type, id }] }

            const [object] = denormalize(ref, entityStoreManager.store)

            expect(object.type).toEqual(userEntity.type)
            expect(object.id).toEqual(userEntity.id)
            expect(object.name).toEqual(userEntity.attributes.name)
        })

        it('A simple entity with a relationship is denormalized', () => {
            const entityStoreManager = new EntityStoreManager()
            const userEntity = makeUserEntity()
            const friendEntity = makeFriendEntity(userEntity.id)

            entityStoreManager.addEntity(userEntity)
            entityStoreManager.addEntity(friendEntity)

            const { type, id } = friendEntity
            const ref = { entities: [{ type, id }] }

            const [object] = denormalize(ref, entityStoreManager.store)

            expect(object.type).toEqual(friendEntity.type)
            expect(object.id).toEqual(friendEntity.id)
            expect(object.name).toEqual(friendEntity.attributes.name)
            expect(object.friend.type).toEqual(userEntity.type)
            expect(object.friend.id).toEqual(userEntity.id)
            expect(object.friend.name).toEqual(userEntity.attributes.name)
        })

        it('A simple entity with plural relationships is denormalized', () => {
            const entityStoreManager = new EntityStoreManager()
            const userEntity = makeUserEntity()
            const userEntity2 = makeUserEntity()
            const friendsEntity = makeFriendsEntity([
                userEntity.id,
                userEntity2.id,
            ])

            entityStoreManager.addEntity(userEntity)
            entityStoreManager.addEntity(userEntity2)
            entityStoreManager.addEntity(friendsEntity)

            const { type, id } = friendsEntity
            const ref = { entities: [{ type, id }] }

            const [object] = denormalize(ref, entityStoreManager.store)

            expect(object.type).toEqual(friendsEntity.type)
            expect(object.id).toEqual(friendsEntity.id)
            expect(object.name).toEqual(friendsEntity.attributes.name)

            expect(object.friends[0].type).toEqual(userEntity.type)
            expect(object.friends[0].id).toEqual(userEntity.id)
            expect(object.friends[0].name).toEqual(userEntity.attributes.name)

            expect(object.friends[1].type).toEqual(userEntity2.type)
            expect(object.friends[1].id).toEqual(userEntity2.id)
            expect(object.friends[1].name).toEqual(userEntity2.attributes.name)
        })
    })

    describe('complex denormalization', () => {
        it('An entity with a child that is also a grandchild and a parent (A->C->G->A, A->G->A)', () => {
            const entityStoreManager = new EntityStoreManager()
            entityStoreManager.addEntity({
                type: 'rootNode',
                id: 'rootNode1',
                relationships: {
                    child: {
                        data: { type: 'child', id: 'child1' },
                    },
                    grandchild: {
                        data: { type: 'grandchild', id: 'grandchild1' },
                    },
                },
            })
            entityStoreManager.addEntity({
                type: 'child',
                id: 'child1',
                relationships: {
                    grandchild: {
                        data: { type: 'grandchild', id: 'grandchild1' },
                    },
                },
            })
            entityStoreManager.addEntity({
                type: 'grandchild',
                id: 'grandchild1',
                relationships: {
                    rootNode: {
                        data: { type: 'rootNode', id: 'rootNode1' },
                    },
                    other: {
                        data: { type: 'other', id: 'other1' },
                    },
                },
            })
            entityStoreManager.addEntity({
                type: 'other',
                id: 'other1',
            })
            const [rootNode] = denormalize(
                { entities: [{ type: 'rootNode', id: 'rootNode1' }] },
                entityStoreManager.store,
            )
            expect(rootNode.grandchild.rootNode).toEqual({
                type: 'rootNode',
                id: 'rootNode1',
                _ref: { data: { type: 'rootNode', id: 'rootNode1' } },
            })
            expect(rootNode.grandchild.other).toEqual({
                type: 'other',
                id: 'other1',
                _ref: { data: { type: 'other', id: 'other1' } },
            })
        })

        it('An entity with a child and an array of grandchildren, and the grandchildren are also a parents (A->C->G[0]->A, A->G[*]->A)', () => {
            const entityStoreManager = new EntityStoreManager()
            entityStoreManager.addEntity({
                type: 'rootNode',
                id: 'rootNode1',
                relationships: {
                    child: {
                        data: { type: 'child', id: 'child1' },
                    },
                    grandchildren: {
                        data: [
                            { type: 'grandchild', id: 'grandchild1' },
                            { type: 'grandchild', id: 'grandchild2' },
                        ],
                    },
                },
            })
            entityStoreManager.addEntity({
                type: 'child',
                id: 'child1',
                relationships: {
                    grandchild: {
                        data: { type: 'grandchild', id: 'grandchild1' },
                    },
                },
            })
            entityStoreManager.addEntity({
                type: 'grandchild',
                id: 'grandchild1',
                relationships: {
                    rootNode: {
                        data: { type: 'rootNode', id: 'rootNode1' },
                    },
                    other: {
                        data: { type: 'other', id: 'other1' },
                    },
                },
            })
            entityStoreManager.addEntity({
                type: 'grandchild',
                id: 'grandchild2',
                relationships: {
                    rootNode: {
                        data: { type: 'rootNode', id: 'rootNode1' },
                    },
                    other: {
                        data: { type: 'other', id: 'other2' },
                    },
                },
            })
            entityStoreManager.addEntity({
                type: 'other',
                id: 'other1',
            })
            entityStoreManager.addEntity({
                type: 'other',
                id: 'other2',
            })
            const [rootNode] = denormalize(
                { entities: [{ type: 'rootNode', id: 'rootNode1' }] },
                entityStoreManager.store,
            )
            expect(rootNode.child.grandchild.rootNode).toEqual({
                type: 'rootNode',
                id: 'rootNode1',
                _ref: { data: { type: 'rootNode', id: 'rootNode1' } },
            })
            expect(rootNode.child.grandchild.other).toEqual({
                type: 'other',
                id: 'other1',
                _ref: { data: { type: 'other', id: 'other1' } },
            })
            expect(rootNode.grandchildren[0].rootNode).toEqual({
                type: 'rootNode',
                id: 'rootNode1',
                _ref: { data: { type: 'rootNode', id: 'rootNode1' } },
            })
            expect(rootNode.grandchildren[0].other).toEqual({
                type: 'other',
                id: 'other1',
                _ref: { data: { type: 'other', id: 'other1' } },
            })
            expect(rootNode.grandchildren[1].rootNode).toEqual({
                type: 'rootNode',
                id: 'rootNode1',
                _ref: { data: { type: 'rootNode', id: 'rootNode1' } },
            })
            expect(rootNode.grandchildren[1].other).toEqual({
                type: 'other',
                id: 'other2',
                _ref: { data: { type: 'other', id: 'other2' } },
            })
        })
    })

    describe('denormalization caching', () => {
        it('Denormalizing adds the immutable entity to the cache', () => {
            const entityStoreManager = new EntityStoreManager()
            const userEntity = makeUserEntity()
            const entity = entityStoreManager.addEntity(userEntity)

            const { type, id } = userEntity
            const ref = { entities: [{ type, id }] }

            denormalize(ref, entityStoreManager.store)
            const cachedEntity = cache.getEntity(type, id)
            expect(entity).toEqual(cachedEntity)
        })

        it('Denormalizing adds the immutable object to the cache', () => {
            const entityStoreManager = new EntityStoreManager()
            const userEntity = makeUserEntity()
            entityStoreManager.addEntity(userEntity)

            const { type, id } = userEntity
            const ref = { entities: [{ type, id }] }

            const [object] = denormalize(ref, entityStoreManager.store)
            const cachedObject = cache.getDenormalized(type, id)
            expect(object).toEqual(cachedObject)
        })

        it('Denormalizing a ref with relationships adds manifest to the cache', () => {
            const entityStoreManager = new EntityStoreManager()
            const userEntity = makeUserEntity()
            const friendEntity = makeFriendEntity(userEntity.id)
            entityStoreManager.addEntity(userEntity)
            entityStoreManager.addEntity(friendEntity)

            const { type, id } = friendEntity
            const ref = { entities: [{ type, id }] }

            denormalize(ref, entityStoreManager.store)

            const manifest = cache.getManifest(type, id)

            expect(manifest).toHaveProperty(userEntity.type)
            expect(manifest[userEntity.type]).toHaveProperty(userEntity.id)

            expect(manifest).toHaveProperty(friendEntity.type)
            expect(manifest[friendEntity.type]).toHaveProperty(friendEntity.id)
        })

        it('If entities in the manifest have not changed, it returns the cached object', () => {
            const entityStoreManager = new EntityStoreManager()
            const userEntity = makeUserEntity()
            const friendEntity = makeFriendEntity(userEntity.id)
            entityStoreManager.addEntity(userEntity)
            entityStoreManager.addEntity(friendEntity)

            const { type, id } = friendEntity
            const ref = { entities: [{ type, id }] }

            const [firstObject] = denormalize(ref, entityStoreManager.store)

            // Add another, unrelated entity to the store
            const userEntity2 = makeUserEntity()
            entityStoreManager.addEntity(userEntity2)

            // Fetch the denormalized object again - it should be cached
            const [secondObject] = denormalize(ref, entityStoreManager.store)
            expect(firstObject).toEqual(secondObject)
        })

        it('If entities in the manifest have changed, it returns a new denormalized object', () => {
            const entityStoreManager = new EntityStoreManager()
            const userEntity = makeUserEntity()
            const friendEntity = makeFriendEntity(userEntity.id)
            entityStoreManager.addEntity(userEntity)
            entityStoreManager.addEntity(friendEntity)

            const { type, id } = friendEntity
            const ref = { entities: [{ type, id }] }

            const [firstObject] = denormalize(ref, entityStoreManager.store)

            // Update the related entity, which should force a re-denormalization
            entityStoreManager.updateEntity({
                type: userEntity.type,
                id: userEntity.id,
                attributes: {
                    favoriteColor: 'blue',
                },
            })

            // Fetch the denormalized object again, it should be reconstructed
            const [secondObject] = denormalize(ref, entityStoreManager.store)
            expect(firstObject === secondObject).toEqual(false)
            expect(secondObject.friend.favoriteColor).toEqual('blue')
        })

        it('If an entity is added to the relationship, it returns a new denormalized object', () => {
            const entityStoreManager = new EntityStoreManager()
            const userEntity = makeUserEntity()
            const userEntity2 = makeUserEntity()

            entityStoreManager.addEntity(userEntity)
            entityStoreManager.addEntity(userEntity2)

            const friendsEntity = makeFriendsEntity([
                userEntity.id,
                userEntity2.id,
            ])

            entityStoreManager.addEntity(friendsEntity)

            const { type, id } = friendsEntity
            const ref = { entities: [{ type, id }] }

            const [firstObject] = denormalize(ref, entityStoreManager.store)

            // Now add a new entity to the store and add it as a relationship to the target object
            const userEntity3 = makeUserEntity()
            entityStoreManager.addEntity(userEntity3)

            // Update the related entity, which should force a re-denormalization
            entityStoreManager.updateEntity({
                type: friendsEntity.type,
                id: friendsEntity.id,
                relationships: {
                    friends: {
                        data: [
                            ...friendsEntity.relationships.friends.data,
                            {
                                type: userEntity3.type,
                                id: userEntity3.id,
                            },
                        ],
                    },
                },
            })

            // Fetch the denormalized object again, it should be reconstructed, but the previously
            // cached objects should remain the same
            const [secondObject] = denormalize(ref, entityStoreManager.store)
            expect(firstObject === secondObject).toEqual(false)
            expect(secondObject.friends).toHaveLength(3)

            expect(firstObject.friends[0]).toEqual(secondObject.friends[0])
            expect(firstObject.friends[1]).toEqual(secondObject.friends[1])
        })

        it('If an entity is removed from the relationship, it returns a new denormalized object', () => {
            const entityStoreManager = new EntityStoreManager()
            const userEntity = makeUserEntity()
            const userEntity2 = makeUserEntity()
            const userEntity3 = makeUserEntity()

            entityStoreManager.addEntity(userEntity)
            entityStoreManager.addEntity(userEntity2)
            entityStoreManager.addEntity(userEntity3)

            const friendsEntity = makeFriendsEntity([
                userEntity.id,
                userEntity2.id,
                userEntity3.id,
            ])

            entityStoreManager.addEntity(friendsEntity)

            const { type, id } = friendsEntity
            const ref = { entities: [{ type, id }] }

            const [firstObject] = denormalize(ref, entityStoreManager.store)

            // Update the target entity, which should force a re-denormalization
            const { data } = friendsEntity.relationships.friends
            const nextData = data.slice(0, 2)
            entityStoreManager.updateEntity({
                type: friendsEntity.type,
                id: friendsEntity.id,
                relationships: {
                    friends: {
                        data: nextData,
                    },
                },
            })

            // Fetch the denormalized object again, it should be reconstructed, but the previously
            // cached objects should remain the same
            const [secondObject] = denormalize(ref, entityStoreManager.store)
            expect(firstObject === secondObject).toEqual(false)
            expect(secondObject.friends).toHaveLength(2)

            expect(firstObject.friends[0]).toEqual(secondObject.friends[0])
            expect(firstObject.friends[1]).toEqual(secondObject.friends[1])
        })

        it('If a related entity is deleted from the store, it returns a new denormalized object', () => {
            const entityStoreManager = new EntityStoreManager()
            const userEntity = makeUserEntity()
            const userEntity2 = makeUserEntity()
            const userEntity3 = makeUserEntity()

            entityStoreManager.addEntity(userEntity)
            entityStoreManager.addEntity(userEntity2)
            entityStoreManager.addEntity(userEntity3)

            const friendsEntity = makeFriendsEntity([
                userEntity.id,
                userEntity2.id,
                userEntity3.id,
            ])

            entityStoreManager.addEntity(friendsEntity)

            const { type, id } = friendsEntity
            const ref = { entities: [{ type, id }] }

            const [firstObject] = denormalize(ref, entityStoreManager.store)

            entityStoreManager.removeEntity(userEntity3)

            // Fetch the denormalized object again, it should be reconstructed, but the previously
            // cached objects should remain the same
            const [secondObject] = denormalize(ref, entityStoreManager.store)
            expect(firstObject === secondObject).toEqual(false)
            expect(secondObject.friends).toHaveLength(3)

            expect(secondObject.friends[0]).toEqual(firstObject.friends[0])
            expect(secondObject.friends[1]).toEqual(firstObject.friends[1])
            expect(secondObject.friends[2]).toEqual(undefined)
        })

        it('Handles updates to deeply nested entities', () => {
            const entityStoreManager = new EntityStoreManager()

            // Set up this relationship:
            // friends -> [user, user2, friend -> user3]

            const userEntity = makeUserEntity()
            const userEntity2 = makeUserEntity()
            const userEntity3 = makeUserEntity()
            const friendEntity = makeFriendEntity(userEntity3.id)

            entityStoreManager.addEntity(userEntity)
            entityStoreManager.addEntity(userEntity2)
            entityStoreManager.addEntity(userEntity3)
            entityStoreManager.addEntity(friendEntity)

            const friendsEntity = makeFriendsEntity([
                userEntity.id,
                userEntity2.id,
                friendEntity.id,
            ])

            entityStoreManager.addEntity(friendsEntity)

            const { type, id } = friendsEntity
            const ref = { entities: [{ type, id }] }

            const [firstObject] = denormalize(ref, entityStoreManager.store)

            entityStoreManager.updateEntity({
                type: userEntity3.type,
                id: userEntity3.id,
                attributes: {
                    favoriteColor: 'red',
                },
            })

            // Fetch the denormalized object again, it should be reconstructed, but the previously
            // cached objects should remain the same
            const [secondObject] = denormalize(ref, entityStoreManager.store)
            expect(firstObject === secondObject).toEqual(false)
            expect(secondObject.friends).toHaveLength(3)

            expect(secondObject.friends[0]).toEqual(firstObject.friends[0])
            expect(secondObject.friends[1]).toEqual(firstObject.friends[1])
            expect(secondObject.friends[2] === firstObject.friends[2]).toEqual(
                false,
            )
            expect(secondObject.friends[2].friend.favoriteColor).toEqual('red')
        })
    })

    describe('extra properties', () => {
        it('adds an _exists property the denormalized data', () => {
            const entityStoreManager = new EntityStoreManager()
            const userEntity = makeUserEntity()
            entityStoreManager.addEntity(userEntity)

            const { type, id } = userEntity
            const ref = { entities: [{ type, id }] }

            const [object] = denormalize(ref, entityStoreManager.store)
            expect(object._exists).toEqual(true)
        })

        it('adds a _ref property of to the original ref being denormalized', () => {
            const entityStoreManager = new EntityStoreManager()
            const userEntity = makeUserEntity()
            entityStoreManager.addEntity(userEntity)

            const { type, id } = userEntity
            const ref = { entities: [{ type, id }] }

            const [object] = denormalize(ref, entityStoreManager.store)
            expect(object._ref).toMatchObject({ data: { type, id } })
        })

        it('adds a _ref property of a relationship being denormalized', () => {
            const entityStoreManager = new EntityStoreManager()
            const userEntity = makeUserEntity()
            const friendEntity = makeFriendEntity(userEntity.id)
            entityStoreManager.addEntity(userEntity)
            entityStoreManager.addEntity(friendEntity)

            const { type, id } = friendEntity
            const ref = { entities: [{ type, id }] }

            const [object] = denormalize(ref, entityStoreManager.store)

            expect(object.friend._ref).toMatchObject({
                data: {
                    type: userEntity.type,
                    id: userEntity.id,
                },
            })
        })

        it('adds a _ref property to a plural relationship being denormalized', () => {
            const entityStoreManager = new EntityStoreManager()
            const userEntity = makeUserEntity()
            const friendsEntity = makeFriendsEntity([userEntity.id])
            entityStoreManager.addEntity(userEntity)
            entityStoreManager.addEntity(friendsEntity)

            const { type, id } = friendsEntity
            const ref = { entities: [{ type, id }] }

            const [object] = denormalize(ref, entityStoreManager.store)

            expect(object.friends._ref).toMatchObject({
                data: [
                    {
                        type: userEntity.type,
                        id: userEntity.id,
                    },
                ],
            })
        })
    })
})
