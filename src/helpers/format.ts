export const formatValue = (value: string, decimals = 18) => {
    if(!value || value === "0") 
        return "0";
    else if(value.length < decimals) 
        return `0.${value}`;
    return `${(Number(value.slice(0, value.length - decimals))).toLocaleString("en-US")}.${value.slice(-1 * decimals)}`
}