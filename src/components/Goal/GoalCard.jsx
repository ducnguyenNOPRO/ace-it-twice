import Button from "@mui/material/Button"
export default function GoalCard() {
    return (
        <div className="flex flex-col w-[48%] gap-3 p-4 mb-2 border border-gray-300">
            <span className="font-medium text-lg">
                Goal Name
            </span>
            <div className="w-full h-7 rounded-md border border-gray-300">
                <div className="h-full w-1/2 bg-blue-400"></div>
            </div>
            <div>
                <span className="font-bold">$400 </span>
                <span>Saved of </span>
                <span className="font-bold">$10,000 Total </span>
                <span>Target </span> 
                <span>(20%)</span>
            </div>
            <div className="flex justify-between">
                <span className="text-sm text-gray-500">Monthly Contribution: $500/month</span>
                <div>
                    <Button
                        variant="outlined"
                        size="small"
                        sx={{mr: 1}}
                    >
                        Add Fund
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                    >
                        Details/Edit
                    </Button>
                </div>
            </div>
        </div>
    )
}