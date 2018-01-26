export function toCamelCase(str: string, capitalize: boolean = false, separator = '_') {
    const parts = str.split(separator)

    if (!parts.length) return str

    const capitalized = parts.slice(1).map(part => part[0].toUpperCase() + part.substr(1))

    capitalized.unshift(parts[0])

    let result = capitalized.join('')

    if (capitalize)
        return result[0].toUpperCase() + result.slice(1)

    return result
}