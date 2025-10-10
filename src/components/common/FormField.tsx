import React from 'react'
import {
  TextField,
  TextFieldProps,
  FormControl,
  Select,
  SelectProps,
  InputLabel,
  FormHelperText,
  Box,
  Typography,
  alpha
} from '@mui/material'
import { CheckCircleOutlined, ErrorOutlineOutlined } from '@mui/icons-material'

interface FormFieldProps extends Omit<TextFieldProps, 'error'> {
  error?: string
  touched?: boolean
  showSuccess?: boolean
}

export const FormField: React.FC<FormFieldProps> = ({
  error,
  touched,
  showSuccess = false,
  sx,
  ...props
}) => {
  const hasError = touched && !!error
  const showSuccessIndicator = touched && !error && showSuccess && props.value

  return (
    <Box sx={{ position: 'relative' }}>
      <TextField
        {...props}
        error={hasError}
        helperText={hasError ? error : props.helperText}
        sx={[
          {
            '& .MuiOutlinedInput-root': {
              borderRadius: 0,
              transition: 'all 0.2s ease',
            },
            '& .MuiFormHelperText-root': {
              mx: 0,
              mt: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: '0.75rem'
            }
          },
          ...(Array.isArray(sx) ? sx : sx ? [sx] : [])
        ]}
        InputProps={{
          ...props.InputProps,
          endAdornment: (
            <>
              {showSuccessIndicator && (
                <CheckCircleOutlined
                  sx={{
                    fontSize: 20,
                    color: 'success.main',
                    mr: 1
                  }}
                />
              )}
              {hasError && (
                <ErrorOutlineOutlined
                  sx={{
                    fontSize: 20,
                    color: 'error.main',
                    mr: 1
                  }}
                />
              )}
              {props.InputProps?.endAdornment}
            </>
          )
        }}
      />
    </Box>
  )
}

interface FormSelectProps extends Omit<SelectProps, 'error'> {
  label: string
  error?: string
  touched?: boolean
  helperText?: string
  required?: boolean
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  error,
  touched,
  helperText,
  required,
  children,
  ...props
}) => {
  const hasError = touched && !!error

  return (
    <FormControl fullWidth error={hasError} required={required}>
      <InputLabel sx={{ '&.Mui-focused': { color: hasError ? 'error.main' : 'primary.main' } }}>
        {label}
      </InputLabel>
      <Select
        {...props}
        label={label}
        sx={{
          borderRadius: 0,
          ...props.sx
        }}
      >
        {children}
      </Select>
      {(hasError || helperText) && (
        <FormHelperText sx={{ mx: 0, mt: 0.5, fontSize: '0.75rem' }}>
          {hasError ? error : helperText}
        </FormHelperText>
      )}
    </FormControl>
  )
}
