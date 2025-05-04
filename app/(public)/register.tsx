// app/(public)/register.tsx
import React from 'react';
import { Card } from '../../src/components/ui';
import { UserRole } from '../../src/domain/models/UserModel';

// Schéma de validation
const RegisterSchema = Yup.object().shape({
  displayName: Yup.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .required('Le nom est requis'),
  email: Yup.string()
    .email('Email invalide')
    .required('L\'email est requis'),
  password: Yup.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .required('Le mot de passe est requis'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Les mots de passe ne correspondent pas')
    .required('La confirmation du mot de passe est requise'),
  role: Yup.string()
    .oneOf(['model', 'professional'], 'Le rôle doit être modèle ou professionnel')
    .required('Le rôle est requis'),
});

interface FormValues {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

export default function RegisterScreen() {
  const router = useRouter();
  const { register, error, clearError } = useAuthViewModel();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const styles = useStyles();

  const handleRegister = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await register({
        email: values.email,
        password: values.password,
        displayName: values.displayName,
        role: values.role,
      });
      router.replace('/(auth)/home');
    } catch (error) {
      Alert.alert('Erreur d\'inscription', (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Modelo</Text>
          <Text style={styles.subtitle}>Créez votre compte</Text>
        </View>

        <Formik
          initialValues={{ 
            displayName: '', 
            email: '', 
            password: '', 
            confirmPassword: '', 
            role: '' as UserRole 
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleRegister}
        >
          {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
            <View style={styles.form}>
              <Input
                label="Nom complet"
                placeholder="Votre nom"
                value={values.displayName}
                onChangeText={handleChange('displayName')}
                onBlur={handleBlur('displayName')}
                error={touched.displayName && errors.displayName ? errors.displayName : undefined}
              />

              <Input
                label="Email"
                placeholder="votre@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                error={touched.email && errors.email ? errors.email : undefined}
              />

              <Input
                label="Mot de passe"
                placeholder="••••••••"
                secureTextEntry
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                error={touched.password && errors.password ? errors.password : undefined}
              />

              <Input
                label="Confirmer le mot de passe"
                placeholder="••••••••"
                secureTextEntry
                value={values.confirmPassword}
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                error={touched.confirmPassword && errors.confirmPassword ? errors.confirmPassword : undefined}
              />

              <Text style={styles.roleLabel}>Je suis un :</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  onPress={() => setFieldValue('role', 'model')}
                  style={{ flex: 1 }}
                >
                  <Card
                    variant={values.role === 'model' ? 'elevated' : 'outlined'}
                    style={[
                      styles.roleCard,
                      values.role === 'model' && styles.selectedRole,
                    ]}
                    padding="md"
                  >
                    <Text style={[
                      styles.roleText,
                      values.role === 'model' && styles.selectedRoleText,
                    ]}>
                      Modèle
                    </Text>
                  </Card>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setFieldValue('role', 'professional')}
                  style={{ flex: 1, marginLeft: 12 }}
                >
                  <Card
                    variant={values.role === 'professional' ? 'elevated' : 'outlined'}
                    style={[
                      styles.roleCard,
                      values.role === 'professional' && styles.selectedRole,
                    ]}
                    padding="md"
                  >
                    <Text style={[
                      styles.roleText,
                      values.role === 'professional' && styles.selectedRoleText,
                    ]}>
                      Professionnel
                    </Text>
                  </Card>
                </TouchableOpacity>
              </View>
              {touched.role && errors.role ? (
                <Text style={styles.errorText}>{errors.role}</Text>
              ) : null}

              <Button
                title="S'inscrire"
                onPress={() => handleSubmit()}
                loading={isSubmitting}
                fullWidth
                size="lg"
                style={{ marginTop: 20 }}
              />
            </View>
          )}
        </Formik>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Vous avez déjà un compte?</Text>
          <TouchableOpacity onPress={() => router.push('/(public)/login')}>
            <Text style={styles.footerLink}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const useStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSizes['3xl'],
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  roleLabel: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  roleContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  roleCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
  },
  selectedRole: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    backgroundColor: theme.colors.primary + '10', // Légère teinte de la couleur primaire
  },
  roleText: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.textSecondary,
  },
  selectedRoleText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.bold,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSizes.sm,
    marginBottom: theme.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  footerText: {
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.xs,
  },
  footerLink: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.medium,
  },
}));