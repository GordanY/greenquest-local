import { useState } from 'react';
import { useSpacetimeDB, useTable } from 'spacetimedb/react';
import { tables } from '../../module_bindings';

export default function GuestHome() {
  const { identity, token } = useSpacetimeDB();
  const [plantTypes] = useTable(tables.plant_types);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [reason, setReason] = useState('');
  const [correctType, setCorrectType] = useState('');
  const [correctName, setCorrectName] = useState('');

  // Store current question number
  // Store current answer (reason + photo)
  // Fetch all the questions
  // Fetch all the answers

  return (
    <div>
      {/* <h1>Guest Home</h1>
      <p>Guest identity: {identity?.toHexString().substring(0, 16)}...</p>
      <p>Guest token: {token?.substring(0, 16)}...</p>
      <p>This is a placeholder for the guest home page.</p> */}




    </div>
  );
}
