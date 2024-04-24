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