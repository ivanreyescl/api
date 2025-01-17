// CONSTANTES

const getDataFromApi = (url) => {
    return fetch(url)
        .then(response => response.json())
        .catch(error => {
            console.error('Error al obtener datos:', error)
            throw error
        })
}



const convertToCurrency = (apiUrl, clpAmount, currency) => {
    getDataFromApi(apiUrl)
        .then(data => {
            const exchangeRate = data.serie[0].valor
            //
            console.log(`${currency}: ${exchangeRate} CLP`)
            
            const convertedValue = (clpAmount / exchangeRate).toFixed(4)
            const symbols = { dolar: '$', euro: '€' }
            const symbol = symbols[currency] || ''

            document.getElementById('api_value').innerHTML = `${symbol}${convertedValue}`
        })
        .catch(error =>
            console.error('Error en la conversión:', error)
        )
}

const handleConversionAndChart = () => {
    const clpAmount = parseFloat(document.getElementById('clp_amount').value)
    const selectedCurrency = document.getElementById('selector').value

    if (isNaN(clpAmount) || clpAmount <= 0) {
        document.getElementById('api_value').innerHTML = `Por favor ingrese un monto válido en CLP, ${isNaN(clpAmount) ? `este valor debe ser un número` : 'debe ser mayor a 0' }` 
        return
    }

    const apiUrl = `https://mindicador.cl/api/${selectedCurrency}`

    convertToCurrency(apiUrl, clpAmount, selectedCurrency)

    getDataFromApi(apiUrl)
        .then(data => {
            //enviar data al chart con los ultimos 10 de la selected currency
            const last10DaysData = data.serie.slice(0, 10).reverse()
            drawChart(last10DaysData, selectedCurrency)
        })
        .catch(error => console.error('Error al obtener los datos del gráfico:', error))
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// CHART

let chart

const drawChart = (data, currency) => {
    const ctx = document.getElementById('chart').getContext('2d')
    const labels = data.map(entry => entry.fecha.split('T')[0])
    const values = data.map(entry => entry.valor)

    if (chart) {
        chart.destroy()
    }

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Valor del ${currency} en los últimos 10 días`,
                data: values,
                borderColor: 'rgba(255, 255, 255, 1)',
                borderWidth: 2,
                fill: false,
            }]
        },
        options: {
            plugins: {
                legend: {
                    labels: {
                        color: 'white'
                    }
                }
            }
        }
    })
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//LISTENERS

document.addEventListener('DOMContentLoaded', () => {
    const convertButton = document.getElementById('convert')
    const currencySelector = document.getElementById('selector')

    if (convertButton) {
        convertButton.addEventListener('click', handleConversionAndChart)
    } else {
        console.error('Botón de conversión no encontrado')
    }

    currencySelector.addEventListener('change', handleConversionAndChart)
})

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
