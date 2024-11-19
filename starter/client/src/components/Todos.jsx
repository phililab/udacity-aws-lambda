import update from 'immutability-helper'
import React, { useEffect, useState } from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Image,
  Loader
} from 'semantic-ui-react'

import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { deleteTodo, getTodos, patchTodo } from '../api/todos-api'
import { NewTodoInput } from './NewTodoInput'

export function Todos() {
  const {user, getAccessTokenSilently} = useAuth0()
  const [todos, setTodos] = useState([])
  const [loadingTodos, setLoadingTodos] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchTodos() {
      try {
        const accessToken = await getAccessTokenSilently({
          audience: `https://dev-ymef3nb010c4irje.us.auth0.com/api/v2/`,
          scope: 'read:todos'
        })
        const todos = await getTodos(accessToken)
        setTodos(todos)
        setLoadingTodos(false)
      } catch (e) {
        alert(`Failed to fetch todos: ${e.message}`)
      }
    }

    fetchTodos()
  }, [getAccessTokenSilently])

  async function onTodoDelete(todoId) {
    try {
      const accessToken = await getAccessTokenSilently({
        audience: `https://dev-ymef3nb010c4irje.us.auth0.com/api/v2/`,
        scope: 'delete:todo'
      })
      await deleteTodo(accessToken, todoId)
      setTodos(todos.filter((todo) => todo.todoId !== todoId))
    } catch (e) {
      alert('Todo deletion failed')
    }
  }

  async function onTodoCheck(pos) {
    try {
      const todo = todos[pos]
      const accessToken = await getAccessTokenSilently({
        audience: `https://dev-ymef3nb010c4irje.us.auth0.com/api/v2/`,
        scope: 'write:todo'
      })
      await patchTodo(accessToken, todo.todoId, {
        name: todo.name,
        dueDate: todo.dueDate,
        done: !todo.done
      })
      setTodos(
          update(todos, {
            [pos]: {done: {$set: !todo.done}}
          })
      )
    } catch (e) {
      console.log('Failed to check a TODO', e)
      alert('Todo update failed')
    }
  }

  function onEditButtonClick(todoId) {
    navigate(`/todos/${todoId}/edit`)
  }

  function renderTodos() {
    if (loadingTodos) {
      return renderLoading()
    }

    return renderTodosList(todos, onTodoCheck, onTodoDelete, onEditButtonClick)
  }

  return (
      <div>
        <Header as="h1">TODOs</Header>

        <NewTodoInput onNewTodo={(newTodo) => setTodos([...todos, newTodo])}/>

        {renderTodos()}
      </div>
  )
}

function renderLoading() {
  return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
  )
}

function renderTodosList(todos, onTodoCheck, onTodoDelete, onEditButtonClick) {
  return (
      <Grid padded>
        {todos.map((todo, pos) => (
            <Grid.Row key={todo.todoId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                    onChange={() => onTodoCheck(pos)}
                    checked={todo.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {todo.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {todo.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                    icon
                    color="blue"
                    onClick={() => onEditButtonClick(todo.todoId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                    icon
                    color="red"
                    onClick={() => onTodoDelete(todo.todoId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {todo.attachmentUrl && (
                  <Grid.Column width={16}>
                    <Image
                        src={todo.attachmentUrl}
                        size="small"
                        wrapped
                        onError={(e) => e.target.style.display = 'none'}
                    />
                  </Grid.Column>
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
        ))}
      </Grid>
  )
}