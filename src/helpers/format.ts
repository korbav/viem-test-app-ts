export const formatValue = (value: string, decimals = 18) => {
    if(!value || value === "0") {
        return "0";
    }
    let intPart = value.slice(0, value.length - decimals);
    let groupSize = 3;
    let groupsCount = Math.ceil(intPart.length / groupSize);
    let groups = [];
    for (let i = 0; i < groupsCount; i++) {
        if (i == 0) groups.push(intPart.slice(- 1 * groupSize))
        else
            groups.push(intPart.slice(-(i + 1) * groupSize, -i * groupSize))
    }
    return `${groups.reverse().join(",")}.${value.slice(-1 * decimals)}`
}