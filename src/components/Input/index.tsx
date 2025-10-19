import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { TextInput, TextInputProps, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface InputFieldProps extends TextInputProps {
  iconName: keyof typeof Feather.glyphMap;
  error?: string;
  isPassword?: boolean;
}

export default function Input({ iconName, error, isPassword = false, ...rest }: InputFieldProps) {
  const [hidePassword, setHidePassword] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Feather name={iconName} size={20} color="black" />
        <TextInput
          style={styles.textInput}
          placeholderTextColor="#777"
          key={hidePassword ? 'password' : 'text'}
          {...rest}
          secureTextEntry={isPassword && hidePassword}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setHidePassword((prev) => !prev)}>
            <Feather name={hidePassword ? 'eye-off' : 'eye'} size={20} color="#555" />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB', // border-gray-300
  },
  textInput: {
    marginLeft: 12,
    flex: 1,
    fontSize: 16, // text-base
    color: '#000000',
  },
  errorText: {
    marginTop: 4,
    fontSize: 14, // text-sm
    color: '#EF4444', // text-red-500
  },
});
