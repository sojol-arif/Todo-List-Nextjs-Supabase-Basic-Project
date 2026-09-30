'use client'

import { supabase } from '@/lib/initSupabase'
import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import Loading from './Loading'

type Todo = {
  id: number
  user_id: string
  task: string
  is_complete: boolean | null
  inserted_at: string
}

export default function TodoList() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <Loading />

  if (!session) {
    return (
      <div className="w-full max-w-md px-4 py-24">
        <LoginForm />
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl px-4 py-16">
      <Todos session={session} />
      <button
        className="mt-12 w-full rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
        onClick={() => supabase.auth.signOut()}
      >
        Logout
      </button>
    </div>
  )
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorText, setErrorText] = useState('')
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)

  const submit = async (mode: 'signin' | 'signup') => {
    setPending(true)
    setErrorText('')
    setMessage('')

    const { data, error } =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })

    if (error) setErrorText(error.message)
    else if (mode === 'signup' && !data.session)
      setMessage('Check your email to confirm your account.')

    setPending(false)
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit('signin')
      }}
      className="flex flex-col gap-3"
    >
      <h1 className="mb-4 text-3xl font-semibold">Todo List</h1>
      <input
        className="rounded w-full p-2 border border-zinc-300 bg-white text-black"
        type="email"
        placeholder="Email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="rounded w-full p-2 border border-zinc-300 bg-white text-black"
        type="password"
        placeholder="Password"
        required
        minLength={6}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {errorText && <div className="text-red-500">{errorText}</div>}
      {message && <div className="text-green-600">{message}</div>}
      <div className="flex gap-2">
        <button
          className="flex-1 rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
          type="submit"
          disabled={pending}
        >
          Sign in
        </button>
        <button
          className="flex-1 rounded border border-zinc-300 px-4 py-2 disabled:opacity-50"
          type="button"
          disabled={pending}
          onClick={(e) => {
            if (e.currentTarget.form?.reportValidity()) submit('signup')
          }}
        >
          Sign up
        </button>
      </div>
    </form>
  )
}

function Todos({ session }: { session: Session }) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTaskText, setNewTaskText] = useState('')
  const [errorText, setErrorText] = useState('')

  const user = session.user

  useEffect(() => {
    const fetchTodos = async () => {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('id', { ascending: true })

      if (error) setErrorText(error.message)
      else setTodos((data ?? []) as Todo[])
    }

    fetchTodos()
  }, [])

  const addTodo = async (taskText: string) => {
    const task = taskText.trim()
    if (!task.length) return

    const { data, error } = await supabase
      .from('todos')
      .insert({ task, user_id: user.id })
      .select()
      .single()

    if (error) {
      setErrorText(error.message)
    } else {
      setTodos((prev) => [...prev, data as Todo])
      setNewTaskText('')
    }
  }

  const deleteTodo = async (id: number) => {
    const { error } = await supabase.from('todos').delete().eq('id', id)
    if (error) setErrorText(error.message)
    else setTodos((prev) => prev.filter((x) => x.id !== id))
  }

  const toggleComplete = async (id: number, isComplete: boolean) => {
    const { data, error } = await supabase
      .from('todos')
      .update({ is_complete: !isComplete })
      .eq('id', id)
      .select()
      .single()

    if (error) setErrorText(error.message)
    else setTodos((prev) => prev.map((todo) => (todo.id === id ? (data as Todo) : todo)))
  }

  return (
    <div className="w-full">
      <h1 className="mb-12 text-3xl font-semibold">Todo List</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          addTodo(newTaskText)
        }}
        className="flex gap-2 my-2"
      >
        <input
          className="rounded w-full p-2 border border-zinc-300 bg-white text-black"
          type="text"
          placeholder="Add a new task"
          value={newTaskText}
          onChange={(e) => {
            setErrorText('')
            setNewTaskText(e.target.value)
          }}
        />
        <button
          className="rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
          type="submit"
        >
          Add
        </button>
      </form>
      {errorText && <div className="text-red-500">{errorText}</div>}
      <div className="bg-white shadow overflow-hidden rounded-md">
        <ul>
          {todos.map((todo) => (
            <li key={todo.id} className="flex items-center p-4 border-b">
              <input
                type="checkbox"
                checked={todo.is_complete ?? false}
                onChange={() => toggleComplete(todo.id, todo.is_complete ?? false)}
                className="mr-3"
              />
              <span className={todo.is_complete ? 'line-through text-zinc-400' : 'text-black'}>
                {todo.task}
              </span>
              <button onClick={() => deleteTodo(todo.id)} className="ml-auto text-red-500">
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}