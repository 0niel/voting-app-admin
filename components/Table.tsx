import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'

export interface Column {
  title: string
  align?: 'left' | 'right' | 'center'
  className?: string
  width?: string
}

export interface Cell {
  value: string | JSX.Element
  className?: string
  onClick?: () => void
}

export interface TableProps {
  title: string
  description: string
  action?: string
  onActionClick?: () => void
  isDisabledAction?: boolean
  columns: Column[]
  rows: Cell[][]
  onRowDelete?: (row: any) => void
}

export default function Table(props: TableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [pageCount, setPageCount] = useState(1)
  const [offset, setOffset] = useState(1)
  const [rows, setRows] = useState(props.rows)

  useEffect(() => {
    setRows(props.rows)
  }, [props.rows])

  useEffect(() => {
    setPageCount(Math.ceil(props.rows.length / itemsPerPage))
    setOffset((currentPage - 1) * itemsPerPage)
  }, [currentPage, itemsPerPage, props.rows.length])

  const handleClick = (page: number) => {
    if (page < 1 || page > pageCount) {
      return
    }
    setCurrentPage(page)
  }

  const filterRows = (value: string) => {
    if (value === '') {
      setRows(props.rows)
      setPageCount(Math.ceil(props.rows.length / itemsPerPage))
      setOffset((currentPage - 1) * itemsPerPage)
      return
    }
    const filteredRows = props.rows.filter((row) => {
      return row.some((cell) => {
        return cell.value.toString().toLowerCase().includes(value.toLowerCase())
      })
    })
    setRows(filteredRows)
    setPageCount(Math.ceil(filteredRows.length / itemsPerPage))
    setOffset((currentPage - 1) * itemsPerPage)
  }

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(parseInt(e.target.value))
    setPageCount(Math.ceil(props.rows.length / parseInt(e.target.value)))
    setOffset((currentPage - 1) * parseInt(e.target.value))
    setCurrentPage(1)
  }

  return (
    <div className='px-4 sm:px-6 lg:px-8'>
      <div className='sm:flex sm:items-center'>
        <div className='sm:flex-auto'>
          <h1 className='text-xl font-semibold text-gray-900'>{props.title}</h1>
          <p className='mt-2 text-sm text-gray-700'>{props.description}</p>
        </div>
        {props.action && (
          <div className='mt-4 sm:mt-0 sm:ml-16 sm:flex-none'>
            <button
              type='button'
              className='hover:bg-primary-700 focus:ring-primary-500 inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white
             shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 sm:w-auto'
              onClick={props.onActionClick}
              disabled={props.isDisabledAction || false}
            >
              {props.action}
            </button>
          </div>
        )}
      </div>
      <div className='mt-8 flex flex-col'>
        <div className='mb-4 flex items-center justify-between'>
          <div className='text-sm text-gray-700'>
            Всего значений: <span className='font-semibold'>{props.rows.length}</span>
          </div>
          <div className='relative'>
            <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
              <MagnifyingGlassIcon className='h-5 w-5 text-gray-400' />
            </div>
            <input
              type='text'
              name='search'
              id='search'
              className='focus:ring-primary-500 focus:border-primary-500 block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 placeholder-gray-400 shadow-sm focus:outline-none sm:text-sm'
              placeholder='Фильтр'
              onChange={(e) => filterRows(e.target.value)}
            />
          </div>
        </div>

        <div className='-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8'>
          <div className='inline-block min-w-full py-2 align-middle md:px-6 lg:px-8'>
            <div className='overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg'>
              <table className='min-w-full divide-y divide-gray-300'>
                <thead className='bg-gray-50'>
                  <tr>
                    {props.columns.map((column) => (
                      <th
                        key={column.title}
                        scope='col'
                        className={`py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 ${
                          column.align === 'right' ? 'text-right' : ''
                        } ${column.align === 'center' ? 'text-center' : ''} ${
                          column.align === 'left' ? 'text-left' : ''
                        } ${column.width ? column.width : ''} ${
                          column.className ? column.className : ''
                        }`}
                      >
                        {column.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200 bg-white'>
                  {rows.slice(offset, offset + itemsPerPage).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className={`py-4 pl-4 pr-3 text-sm ${
                            cell.className ? cell.className : ''
                          }`}
                          onClick={cell.onClick}
                        >
                          {cell.value}
                        </td>
                      ))}
                      {props.onRowDelete && (
                        <td className='relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6'>
                          <button
                            type='button'
                            className='text-red-600 hover:text-red-900'
                            onClick={() => props.onRowDelete?.(row)}
                          >
                            Удалить
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className='flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6'>
                <div className='hidden sm:flex sm:flex-1 sm:items-center sm:justify-between'>
                  <div>
                    <p className='text-sm text-gray-700'>
                      <span className='px-2 py-2 font-medium'>Записей на странице:</span>
                      <select
                        id='rowsPerPage'
                        className='w-15 mr-8'
                        onChange={handleItemsPerPageChange}
                        defaultValue={10}
                      >
                        <option value={5} className='block w-full'>
                          5
                        </option>
                        <option value={10} className='block w-full'>
                          10
                        </option>
                        <option value={15} className='block w-full'>
                          15
                        </option>
                        <option value={20} className='block w-full'>
                          20
                        </option>
                        <option value={25} className='block w-full'>
                          25
                        </option>
                        <option value={30} className='block w-full'>
                          30
                        </option>
                      </select>
                      <span className='font-medium'>{offset + 1}</span> -{' '}
                      <span className='font-medium'>{offset + itemsPerPage}</span> из{' '}
                      <span className='font-medium'>{props.rows.length}</span>
                    </p>
                  </div>
                  <div>
                    <nav
                      className='isolate inline-flex -space-x-px rounded-md shadow-sm'
                      aria-label='Pagination'
                    >
                      <a
                        href='#'
                        onClick={() => handleClick(currentPage - 1)}
                        className='relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      >
                        <span className='sr-only'>Предыдущая</span>
                        <ChevronLeftIcon className='h-5 w-5' aria-hidden='true' />
                      </a>
                      {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
                        <a
                          key={page}
                          href='#'
                          onClick={() => handleClick(page)}
                          className={`${
                            currentPage === page
                              ? 'z-10 bg-secondary text-white'
                              : 'text-gray-900 hover:bg-gray-50'
                          } relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0`}
                        >
                          {page}
                        </a>
                      ))}
                      <a
                        href='#'
                        onClick={() => handleClick(currentPage + 1)}
                        className='relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      >
                        <span className='sr-only'>Следующая</span>
                        <ChevronRightIcon className='h-5 w-5' aria-hidden='true' />
                      </a>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
