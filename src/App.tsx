import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee } from "./utils/types"

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees()
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions()
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState("")

  const transactions = useMemo(() => paginatedTransactions?.data ?? transactionsByEmployee ?? null, [
    paginatedTransactions,
    transactionsByEmployee,
  ])

  const loadAllTransactions = useCallback(async () => {
    transactionsByEmployeeUtils.invalidateData()
    await employeeUtils.fetchAll()
    paginatedTransactionsUtils.fetchAll()
  }, [employeeUtils, paginatedTransactionsUtils, transactionsByEmployeeUtils])

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      paginatedTransactionsUtils.invalidateData()
      await transactionsByEmployeeUtils.fetchById(employeeId)
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  )

  useEffect(() => {
    // Bug # Fix:
    setIsLoading(true)

    if (employees === null && !employeeUtils.loading) {
      loadAllTransactions()
      console.log(transactions)
    }
    setIsLoading(false)
  }, [employeeUtils.loading, employees, loadAllTransactions])

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          // Bug # Fix: Loads when employees finishes loading via using utils
          isLoading={employeeUtils.loading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            console.log("new dropdown value:" + newValue!.firstName)
            setIsLoading(true)

            // Bug 3 Fix: Call the predefined function to load all transactions
            if (newValue!.id === "") {
              loadAllTransactions()
              setSelectedEmployee("")
            } else {
              await loadTransactionsByEmployee(newValue!.id)
              setSelectedEmployee(newValue!.id)
            }
            setIsLoading(false)
          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          <Transactions transactions={transactions} />
          {transactions !== null && (
            <button
              // Bug # Fix:
              style={{
                visibility: transactionsByEmployeeUtils.loading ? "hidden" : "visible",
              }}
              className="RampButton"
              disabled={paginatedTransactionsUtils.loading}
              // Bug 6 Fix: Check if there is a next page, if not return
              onClick={async () => {
                if (!paginatedTransactions?.nextPage) {
                  return
                }
                // Bug 4 Fix: Created a state to keep track of selected employee
                // so clicking "view more" will only load that employee's data
                if (selectedEmployee) {
                  loadTransactionsByEmployee(selectedEmployee)
                } else {
                  loadAllTransactions()
                }
              }}
            >
              View More
            </button>
          )}
        </div>
      </main>
    </Fragment>
  )
}
