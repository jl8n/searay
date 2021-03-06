import React, { FC, useState, useEffect, useCallback, SyntheticEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { ReactComponent as Logo } from 'assets/svg/mantaray.svg';
import Greeter from 'artifacts/contracts/Greeter.sol/Greeter.json';  // greeter abi
import smartContract from 'artifacts/smart-contract.json';  // smart contract hash
import './App.scss';

declare let window: any;


const App:FC = () => {
  const navigate = useNavigate();
  const logout = useCallback(() => navigate('/login', { replace: true }), [navigate]);

  const [account, setAccount] = useState('');
  const [greeting, setGreet] = useState('');

  const prettyWallet = account[0] ? account[0].slice(0, 5) + '...' + account[0].slice(-4) : 'Error';
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  async function handleAccount() {
    // we already have the account from logging in
    const eth = await window.ethereum.request({ method: 'eth_requestAccounts' });

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setAccount(await provider.send('eth_requestAccounts', []));
    
    console.log('account handle', account);
    return true;
  }

  // request access to the user's MetaMask account
  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  async function fetchGreeting() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(smartContract.address, Greeter.abi, provider);
      try {
        const data = await contract.greet();
        console.log('data: ', data);
      } catch (err) {
        console.log('Error: ', err);
      }
    }    
  }

  async function pushGreeting(e: SyntheticEvent) {
    e.preventDefault();
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(smartContract.address, Greeter.abi, signer);
      const transaction = await contract.setGreeting(greeting);
      await transaction.wait();
      fetchGreeting();
    }
  }


  useEffect(() => {
    handleAccount();
  }, []);

  return (
    <div className='page grid'>
      <header className="justify-between" >

        <div className="row items-center gap-x-lg">
          <Logo className='logo-image'/>
          <h1>SeaRay</h1>
        </div>

        <div className="dropdown">
          <button className="userDropdown">
            <div className="one">{ prettyWallet }</div>
          </button>
          <div className="dropdown-content">
            <button onClick={ logout }>Logout</button>
          </div>
        </div>
      </header>
  
      <main>
        <section className="gap-md">
          <div>{ smartContract.address }</div>
          <div>{ greeting }</div>
          <button onClick={ fetchGreeting }>Fetch greeting!</button>
          <form onSubmit={ (e: React.SyntheticEvent) => {
            pushGreeting(e);

            const target = e.target as typeof e.target & {
              email: { value: string };
              password: { value: string };
            };
            const email = target.email.value; // typechecks!
            const password = target.password.value; // typechec
          }}>
            <input type="text" value={ greeting } onChange={ (e) => setGreet(e.target.value) }name="greeting" />
            <input type="submit" value="Submit" />
          </form>



          <form className='column gap-y-md'>
            <div className="row gap-x-md">
              <div className="column">
                <label>Firstname</label>
                <input type="text" />
              </div>
              <div className="column">
                <label>Lastname</label>
                <input type="text" />
              </div>
            </div>

            <div className="row gap-x-md">
              <div className="column">
                <label>Email</label>
                <input type="email" />
              </div>
              <div className="column">
                <label>Phone</label>
                <input type="tel" />
              </div>
            </div>


            <label htmlFor="start">Start date:</label>
            <input type="date" id="start" name="trip-start" defaultValue="2018-07-22" min="2018-01-01" max="2018-12-31" />


            <button type="submit">Submit</button>
          </form>
        </section>


      </main>

    </div>
  );
};

export default App;
