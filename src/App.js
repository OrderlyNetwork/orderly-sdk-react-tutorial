import {useState} from "react";
import './App.css';
import { Button, Text, Badge, Card, CardHeader, CardBody, CardFooter, NumberInput, NumberInputField } from "@chakra-ui/react";
import { AuthClient } from '@orderly.network/orderly-sdk';
import ReactJson from 'react-json-view'

function App() {
    const [connected, setConnected] = useState(false)
    const [balance, setBalance] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [sdk, setSDK] = useState(null);
    const [wsClientPublic, setWsClientPublic] = useState(null);
    const [wsClientPrivate, setWsClientPrivate] = useState(null);
    const [apiClient, setApiClient] = useState(null);
    const [contractClient, setContractClient] = useState(null);
    const [ftClient, setFtClient] = useState(null);
    const [accountId, setAccountId] = useState(null);
    const [createOrderResponse, setCreateOrderResponse] = useState(null);
    const [orderIdForCancel, setOrderIdForCancel] = useState(0);
    const [cancelOrderResponse, setCancelOrderResponse] = useState(null);
    const [getOrdersResponse, setGetOrdersResponse] = useState(null);
    const [possibleTokensResponse, setPossibleTokensResponse] = useState(null);
    const [depositNearAmount, setDepositNearAmount] = useState(0);
    const [depositNearResponse, setDepositNearAmountResponse] = useState(null);
    const [depositUsdcAmount, setDepositUsdcAmount] = useState(0);
    const [withdrawUsdcAmount, setWithdrawUsdcAmount] = useState(0);
    const [withdrawStorageAmount, setWithdrawStorageAmount] = useState(0);
    const [tradingKeys, setTradingKeys] = useState(null);

    const initPublicWs = () => {
      const authClient = new AuthClient({
        networkId: 'testnet',
        contractId: 'asset-manager.orderly.testnet',
        debug: true
      });

      const wsPublic = authClient.wsClientPublic('testnet', 'bf6eb263984c964a0cda3e9a35aa486268eea085d9b90fe792c8f9ad7e129a2c');
      wsPublic.connect();
      setWsClientPublic(wsPublic)
      
    }

    const handleConnect = async() => {
      setIsConnecting(true);
      const authClient = new AuthClient({
        networkId: 'testnet',
        contractId: 'asset-manager.orderly.testnet',
        debug: true
      });
      await authClient?.connect()
      setSDK(authClient);
      const api = await authClient.restApi()
      const contract = await authClient.contractsApi();
      const ft = await authClient.ftClient();
      const ws = await authClient.wsClientPrivate();
      await ws.connectPrivate();
      
      ws.setPrivateMessageCallback((message) => {
        // Process the received message
        console.log('Received data:', message);
      });

      console.log(authClient.accountId())
      setAccountId(authClient.accountId())
      setApiClient(api)
      setWsClientPrivate(ws);
      setContractClient(contract)
      setFtClient(ft)
      setIsConnecting(false)
      setConnected(true)
    };

    const handleLogAccountId = async () => {
      const response = await sdk.accountId();
      setAccountId(response)
    }

    const handleGenerateTradingKey = () => {
      const response = sdk.generateTradingKey()
      console.log('Trading Keys: ', response)
      const { keyPair, ...keys } = response;
      setTradingKeys(keys)
    }

    const createOrder = async () => {
      const order = {
        symbol: 'SPOT_NEAR_USDC',
        order_type: 'LIMIT',
        side: 'BUY',
        order_price: 1.111,
        order_quantity: 2
      }
      const response = await apiClient.orders.create(order)
      setCreateOrderResponse(response)
    }
    
    const getOrders = async () => {
      const orders = await apiClient.orders.getOrders({symbol: 'SPOT_NEAR_USDC'})
      setGetOrdersResponse(orders)
    }

    const possibleTokens = async () => {
      const tokens = await contractClient.getPossibleTokens()
      setPossibleTokensResponse(tokens)
    }

    const cancelOrder = async () => {
      if (orderIdForCancel) {
        const response = await apiClient.orders.cancel({order_id: orderIdForCancel, symbol: 'SPOT_NEAR_USDC'});
        setCancelOrderResponse(response)
      }
    }

    const depositNEAR = async () => {
      if (depositNearAmount) {
        const response = await contractClient.depositNEAR(depositNearAmount)
        setDepositNearAmountResponse(response)
      }
    }

    const storageBalanceOf = async () => {
      if (accountId) {
        const response = await contractClient.storageBalanceOf(accountId)
        console.log(response)
      }
    }

    const storageUsageOf = async () => {
      if (accountId) {
        const response = await contractClient.storageUsageOf(accountId)
        console.log(response)
      }
    }

    const depositUSDC = async () => {
      if (depositUsdcAmount) {
        const USDC_DECIMALS = 6;
        await ftClient.deposit(depositUsdcAmount * Math.pow(10, USDC_DECIMALS), 'usdc.orderly.testnet')
      }
    }

    const withdrawUSDC = async () => {
      if (withdrawUsdcAmount) {
        const USDC_DECIMALS = 6;
        await contractClient.withdraw({token: 'usdc.orderly.testnet', amount: withdrawUsdcAmount * Math.pow(10, USDC_DECIMALS)})
      }
    }

    const withdrawStorage = async () => {
      await contractClient.storage.withdraw('1')
    }

    const connect = async () => {
      handleConnect()
    }

    const signout = async () => {
      console.log(sdk.isSignedIn())
      await sdk.signOut();
      console.log(sdk.isSignedIn())
      setConnected(false);
    }

    const publicClient = async () => {
      // const authClient = new AuthClient({
      //   networkId: 'testnet',
      //   contractId: 'asset-manager.orderly.testnet',
      //   debug: true
      // });
      // console.log(authClient)
      // const pubClient = authClient.publicClient();
      // const available = await pubClient.getAvailableSymbols()
      // console.log(available)

      const authClient = new AuthClient({
        networkId: 'testnet',
        contractId: 'asset-manager.orderly.testnet',
        debug: true
      });

      const api = authClient.nearJsApi
      console.log(api)
    }

    const getBalance = async () => {
      const userBalance = await contractClient.getUserTokenBalance()
      setBalance(userBalance)
    }

    const subscribe = () => {
      const subscription = { id: 'client_id1', event: 'subscribe', topic: 'SPOT_WOO_USDC@trade' };
      wsClientPublic.sendSubscription(subscription);
    }

    const subscribePrivate = () => {
      const subscription = {
        "id": "123r",
        "topic": "balance",
        "event": "subscribe"
      }
      wsClientPrivate.sendPrivateSubscription(subscription);
    }

  return (
    <div className="App">
      <header>
        <div className="logo">
          <img src="https://www.gitbook.com/cdn-cgi/image/width=40,height=40,fit=contain,dpr=2,format=auto/https%3A%2F%2F1405416796-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FHLMZIGVR3rR3JNsj0vCF%252Ficon%252F19XW93iMrrl7KSI7qhCY%252FOrderly%2520Network_Brandmark_Gradient.jpg%3Falt%3Dmedia%26token%3De49bd955-54f6-4357-8f25-d17b258100e7" className="App-logo" alt="logo" />
          <Text fontSize='lg'>Orderly SDK Demo</Text>
        </div>
        <Button style={{padding: 20}} onClick={!connected ? connect : signout}>{
          isConnecting ? 'Connections' : !connected ? 'Connect Wallet' : 'Sign Out'
        }</Button>
      </header>
      <Card maxW='sm' style={{marginLeft: 20}}>
            <CardHeader>
              <Text fontSize='xl'>
                WS subscribe
              </Text>
            </CardHeader>
            <CardBody>
            </CardBody>
            <CardFooter>
              <Button onClick={initPublicWs}>Init public ws connection</Button>
              <Button onClick={subscribe}>subscribe</Button>
            </CardFooter>
      </Card>
      {connected && (
          <div className="bodyWrapper">
          <div className="row">
            <Button style={{marginRight:20}} onClick={handleLogAccountId}>Get account ID</Button>
            <Badge style={{marginRight:20}}>{accountId ? accountId : ''}</Badge>
            <Button style={{marginRight:20}} onClick={getBalance}>Get Balance</Button>
            {balance && (
              balance.map((item, index) => {
                return (
                  <Badge ml='1' fontSize='1rem' key={index}>{item[0]} : {item[1].balance}</Badge>
                )
              })
            )}
          </div>
          <div className="cards">
          <Card maxW='sm' style={{marginRight: 20}}>
            <CardHeader>
              <Text fontSize='xl'>
              Get Orders
              </Text>
            </CardHeader>
            <CardBody>
              {getOrdersResponse && <ReactJson src={getOrdersResponse} />}
            </CardBody>
            <CardFooter>
              <Button onClick={getOrders}>Get Orders</Button>
            </CardFooter>
          </Card>
          <Card maxW='sm'>
            <CardHeader>
              <Text fontSize='xl'>
              Create Order
              </Text>
            </CardHeader>
            <CardBody>
              <ReactJson src={{
                    symbol: 'SPOT_NEAR_USDC',
                    order_type: 'LIMIT',
                    side: 'BUY',
                    order_price: 1.111,
                    order_quantity: 2
                }} />
              <Text>{createOrderResponse ? JSON.stringify(createOrderResponse) : ''}</Text>
            </CardBody>
            <CardFooter>
              <Button onClick={createOrder}>Create order</Button>
            </CardFooter>
          </Card>
          <Card maxW='sm' style={{marginLeft: 20}}>
            <CardHeader>
              <Text fontSize='xl'>
              Cancel Order
              </Text>
            </CardHeader>
            <CardBody>
              <NumberInput value={orderIdForCancel} placeholder="Enter order_id" onChange={(value) => setOrderIdForCancel(Number(value))}>
                <NumberInputField />
              </NumberInput>
              <Text>{cancelOrderResponse ? JSON.stringify(cancelOrderResponse) : ''}</Text>
            </CardBody>
            <CardFooter>
              <Button onClick={cancelOrder}>Cancel order</Button>
            </CardFooter>
          </Card>
          <Card maxW='sm' style={{marginLeft: 20}}>
            <CardHeader>
              <Text fontSize='xl'>
                Possible tokens
              </Text>
            </CardHeader>
            <CardBody>
              <Text>{possibleTokensResponse ? JSON.stringify(possibleTokensResponse) : ''}</Text>
            </CardBody>
            <CardFooter>
              <Button onClick={possibleTokens}>Get possible tokens</Button>
            </CardFooter>
          </Card>
          <Card maxW='sm' style={{marginLeft: 20}}>
            <CardHeader>
              <Text fontSize='xl'>
                Deposit NEAR
              </Text>
            </CardHeader>
            <CardBody>
              <NumberInput value={depositNearAmount} placeholder="Enter NEAR amount" onChange={(value) => setDepositNearAmount(Number(value))}>
                <NumberInputField />
              </NumberInput>
              <Text>{depositNearResponse ? JSON.stringify(depositNearResponse) : ''}</Text>
            </CardBody>
            <CardFooter>
              <Button onClick={depositNEAR}>Deposit</Button>
            </CardFooter>
          </Card>
          <Card maxW='sm' style={{marginLeft: 20}}>
            <CardHeader>
              <Text fontSize='xl'>
                Deposit USDC
              </Text>
            </CardHeader>
            <CardBody>
              <NumberInput value={depositUsdcAmount} placeholder="Enter USDC amount" onChange={(value) => setDepositUsdcAmount(Number(value))}>
                <NumberInputField />
              </NumberInput>
            </CardBody>
            <CardFooter>
              <Button onClick={depositUSDC}>Deposit</Button>
            </CardFooter>
          </Card>
          <Card maxW='sm' style={{marginLeft: 20}}>
            <CardHeader>
              <Text fontSize='xl'>
                Withdraw USDC
              </Text>
            </CardHeader>
            <CardBody>
              <NumberInput value={withdrawUsdcAmount} placeholder="Enter USDC amount" onChange={(value) => setWithdrawUsdcAmount(Number(value))}>
                <NumberInputField />
              </NumberInput>
            </CardBody>
            <CardFooter>
              <Button onClick={withdrawUSDC}>Withdraw</Button>
            </CardFooter>
          </Card>
          <Card maxW='sm' style={{marginLeft: 20}}>
            <CardHeader>
              <Text fontSize='xl'>
                Withdraw Storage
              </Text>
            </CardHeader>
            <CardBody>
              <NumberInput value={withdrawStorageAmount} placeholder="Enter USDC amount" onChange={(value) => setWithdrawStorageAmount(Number(value))}>
                <NumberInputField />
              </NumberInput>
            </CardBody>
            <CardFooter>
              <Button onClick={withdrawStorage}>Withdraw</Button>
            </CardFooter>
          </Card>

          <Card maxW='sm' style={{marginLeft: 20}}>
            <CardHeader>
              <Text fontSize='xl'>
                Generate Trading Key
              </Text>
            </CardHeader>
            <CardBody>
              {tradingKeys && `Look in console!`}
            </CardBody>
            <CardFooter>
              <Button onClick={handleGenerateTradingKey}>Generate</Button>
            </CardFooter>
          </Card>

          <Card maxW='sm' style={{marginLeft: 20}}>
            <CardHeader>
              <Text fontSize='xl'>
                WS subscribe private
              </Text>
            </CardHeader>
            <CardBody>
            </CardBody>
            <CardFooter>
              <Button onClick={subscribePrivate}>subscribe</Button>
            </CardFooter>
          </Card>
          <Card maxW='sm' style={{marginLeft: 20}}>
            <CardHeader>
              <Text fontSize='xl'>
                Log storage balance
              </Text>
            </CardHeader>
            <CardBody>
            </CardBody>
            <CardFooter>
              <Button onClick={storageBalanceOf}>storageBalanceOf</Button>
            </CardFooter>
          </Card>
          <Card maxW='sm' style={{marginLeft: 20}}>
            <CardHeader>
              <Text fontSize='xl'>
                Log storage usage
              </Text>
            </CardHeader>
            <CardBody>
            </CardBody>
            <CardFooter>
              <Button onClick={storageUsageOf}>storageUsageOf</Button>
            </CardFooter>
          </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
