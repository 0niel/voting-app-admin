import React from 'react'

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
  columns: Column[]
  rows: Cell[][]
  onRowDelete?: (row: any) => void
}

export default function Table(props: TableProps) {
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
              className='hover:bg-primary-700 focus:ring-primary-500 inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium
             text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto'
              onClick={props.onActionClick}
            >
              {props.action}
            </button>
          </div>
        )}
      </div>
      <div className='mt-8 flex flex-col'>
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
                  {props.rows.map((row, rowIndex) => (
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
