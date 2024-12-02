import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the types for Transaction and FlatList data rendering
interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
}

const App: React.FC = () => {
  const [amount, setAmount] = useState<string>(''); // Amount as string input
  const [description, setDescription] = useState<string>(''); // Description input
  const [transactions, setTransactions] = useState<Transaction[]>([]); // Transactions list
  const [balance, setBalance] = useState<number>(0); // Balance

  useEffect(() => {
    loadTransactions(); // Load transactions on initial render
  }, []);

  // Load transactions from AsyncStorage
  const loadTransactions = async () => {
    try {
      const storedTransactions = await AsyncStorage.getItem('transactions');
      if (storedTransactions !== null) {
        const parsedTransactions: Transaction[] = JSON.parse(storedTransactions);
        setTransactions(parsedTransactions);
        calculateBalance(parsedTransactions);
      }
    } catch (e) {
      console.log('Failed to load transactions', e);
    }
  };

  // Save transactions to AsyncStorage
  const saveTransactions = async (newTransactions: Transaction[]) => {
    try {
      await AsyncStorage.setItem('transactions', JSON.stringify(newTransactions));
    } catch (e) {
      console.log('Failed to save transactions', e);
    }
  };

  // Add new transaction (income or expense)
  const addTransaction = (type: 'income' | 'expense') => {
    const value = parseFloat(amount);
    if (isNaN(value) || !description) {
      Alert.alert('Input Error', 'Please enter valid amount and description.');
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now(),
      type,
      amount: value,
      description,
      date: new Date().toLocaleString(),
    };

    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    calculateBalance(updatedTransactions);
    saveTransactions(updatedTransactions);

    setAmount('');
    setDescription('');
  };

  // Calculate the balance from transactions
  const calculateBalance = (transactions: Transaction[]) => {
    let total = 0;
    transactions.forEach((transaction) => {
      if (transaction.type === 'income') {
        total += transaction.amount;
      } else {
        total -= transaction.amount;
      }
    });
    setBalance(total);
  };

  const renderItem = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <Text style={styles.transactionText}>
        {item.description} - {item.type === 'income' ? '+' : '-'}{item.amount}
      </Text>
      <Text>{item.date}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Koinku</Text>
      <Text style={styles.balance}>Saldo Saat Ini: Rp {balance}</Text>

      {/* Input Form */}
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Jumlah"
        value={amount}
        onChangeText={setAmount}
      />
      <TextInput
        style={styles.input}
        placeholder="Deskripsi"
        value={description}
        onChangeText={setDescription}
      />
      <View style={styles.buttonContainer}>
        <Button title="Tambah Pemasukan" onPress={() => addTransaction('income')} />
        <Button title="Tambah Pengeluaran" onPress={() => addTransaction('expense')} color="red" />
      </View>

      {/* Transaction History */}
      <Text style={styles.historyHeader}>Riwayat Transaksi</Text>
      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  balance: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  historyHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  transactionItem: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  transactionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;
