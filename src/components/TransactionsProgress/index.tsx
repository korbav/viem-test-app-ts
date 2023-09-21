import { useState, forwardRef, useImperativeHandle, useContext } from "react";
import { ThreeCircles } from  'react-loader-spinner'
import { AppStateContext } from "../../context/AppStateContext";
import { genericSuccessAlert } from "../../helpers/viem/notifications";

type ExpectedTransaction = {
    transactionHash: string
}

export default forwardRef((_, ref) => {
    const [expectedTransactions, setExpectedTransactions] = useState<ExpectedTransaction[]>([]);
    const { setWaitingForTransaction } = useContext(AppStateContext);

    useImperativeHandle(ref, () => ({
         waitForTransactionHash: (transactionHash: string) => {
            setExpectedTransactions((expectedTransactions) => [...expectedTransactions, { transactionHash }]);
            setWaitingForTransaction(true)
        },

        notify: (transactionHash: string) => {
            for(let i = 0; i < expectedTransactions.length; i++) {
                const expectedTransaction = expectedTransactions[i];
                if(transactionHash.toLowerCase() === expectedTransaction.transactionHash.toLowerCase()) {
                    const expectedTransactionsCopy = [...expectedTransactions]
                    expectedTransactionsCopy.splice(i, 1)
                    setExpectedTransactions(expectedTransactionsCopy)
                    if(expectedTransactionsCopy.length === 0) {
                        setWaitingForTransaction(false)
                    }
                    genericSuccessAlert("Transaction confirmed");
                    break;
                }
            }
        },

        isLoading: () => expectedTransactions.length > 0
    }));

    return expectedTransactions.length > 0 ? (
        <div className="fixed bottom-3 right-4 z-10">
            <ThreeCircles
                height="40"
                width="40"
                color="#FFFFFF"
                outerCircleColor="#FFFFFF"
                innerCircleColor="rgb(59 130 246 / 0.9)"
                middleCircleColor="rgb(59 130 246 / 0.5)"
                ariaLabel="puff-loading"
                wrapperStyle={{}}
                wrapperClass=""
                visible={true}
            />
        </div>
    ) : null;
});