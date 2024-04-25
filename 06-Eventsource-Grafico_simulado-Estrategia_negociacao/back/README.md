Conectar ao servidor e imprimir dados recebidos no console do navegador

```javascript

const eventSource = new EventSource('http://localhost:3001/init');
eventSource.onmessage = (event) => {
    msg = JSON.parse(event.data);
    console.log(JSON.stringify(msg, null, 2));
};
```

Salvar no storage do navegador
```javascript
sessionStorage.removeItem('trades');
const eventSource = new EventSource('http://localhost:3001/init');
eventSource.onmessage = (event) => {
    msg = JSON.parse(event.data);
    localStorage.setItem('trades', JSON.stringify(msg.trades));
};

```

Encerra a conexão

```javascript
eventSource.close()
```


```sql
SELECT 
    id,
    date,
    profit,
    usdBalance,
    btcBalance,
    totalBalance,
    opentrades,
    buy_time,
    buy_price,
    buy_units,
    (buy_units * buy_price) AS total_value_bought,
	ROUND((profit / (buy_units * buy_price) * 100), 2) AS percent_profit
FROM 
    trades_2542024_123127;
```

```sql
select ROUND(sum(total_value_bought),2) as total_investido, 
	ROUND(sum(profit),2) as total_ganho,
	ROUND((sum(profit) / sum(total_value_bought) * 100),2) AS percent_profit
	from (
	SELECT 
		id,
		date,
		profit,
		usdBalance,
		btcBalance,
		totalBalance,
		opentrades,
		buy_time,
		buy_price,
		buy_units,
		(buy_units * buy_price) AS total_value_bought
	FROM 
		trades_2542024_123127
	WHERE	
		status = "closed"
	)
```