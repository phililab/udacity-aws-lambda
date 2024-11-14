import {createLogger} from "../utils/logger.mjs"
import {DynamoDB} from '@aws-sdk/client-dynamodb'
import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb'
import AWSXRay from 'aws-xray-sdk-core'
import {getUploadUrl} from "../fileStorage/attachmentUtils.mjs"

const logger = createLogger('INFO')
const todosTable = process.env.TODOS_TABLE
const todosCreatedAtIndex = process.env.TODOS_CREATED_AT_INDEX
const dbClient = AWSXRay.captureAWSv3Client(new DynamoDB())
const docClient = DynamoDBDocument.from(dbClient)

export const todosAccess = {
    // CREATE
    async createTodo(todo) {
        logger.info('Todo created')

        try {
            await docClient.put({
                TableName: todosTable,
                Item: todo
            })
            return todo
        } catch (error) {
            logger.error('Creation failed')
            throw new Error(error.message)
        }
    },
    // READ
    async getTodos(userId) {
        logger.info('Get todos')
        try {
            const command = await docClient.query({
                TableName: todosTable,
                IndexName: todosCreatedAtIndex,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId
                }
            })
            return command.Items
        } catch (error) {
            logger.error('Get todos failed')
            throw new Error(error.message)
        }
    },
    // UPDATE
    async updateTodo(userId, todoId, body) {
        logger.info('Update todo')

        try {
            await docClient.update({
                TableName: todosTable,
                Key: {
                    userId,
                    todoId,
                },
                UpdateExpression: 'set #name = :name, #dueDate = :dueDate, #done = :done',
                ExpressionAttributeNames: {
                    '#name': 'name',
                    '#dueDate': 'dueDate',
                    '#done': 'done'
                },
                ExpressionAttributeValues: {
                    ':name': body.name,
                    ':dueDate': body.dueDate,
                    ':done': body.done
                },
                ReturnValues: 'ALL_NEW'
            })
            return "Updated"
        } catch (error) {
            logger.error('Update failed')
            throw new Error(error.message)
        }
    },
    // DELETE
    async deleteTodo(userId, todoId) {
        logger.info('Delete todo')

        try {
            await docClient.delete({
                TableName: todosTable,
                Key: {
                    userId,
                    todoId
                }
            })
            return "Deleted"
        } catch (error) {
            logger.error('Deletion failed')
            throw new Error(error.message)
        }
    },
    // UPLOAD IMAGE
    async getUploadUrl(todoId) {
        logger.info('Generate image url')

        try {
            return await getUploadUrl(todoId)
        } catch (error) {
            logger.error('Image upload failed')
            throw new Error(error.message)
        }
    }
}