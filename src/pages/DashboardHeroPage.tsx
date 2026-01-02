import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  Avatar
} from '@mui/material'
import {
  AddOutlined,
  EditOutlined,
  DeleteOutlined,
  ImageOutlined
} from '@mui/icons-material'
import { useHeroSections, useCreateHero, useUpdateHero, useDeleteHero, useUploadHeroImage } from '@/hooks/useHero'
import { PageLoader } from '@/components/common'
import { HeroSection, CreateHeroInput } from '@/types/hero'

export const DashboardHeroPage: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingHero, setEditingHero] = useState<HeroSection | null>(null)
  const [formData, setFormData] = useState<CreateHeroInput>({
    headline: '',
    subheadline: '',
    imageUrl: '',
    buttonText: '',
    buttonLink: '',
    isActive: true,
    displayOrder: 0,
    titleColor: '#FFFFFF',
    subtitleColor: '#FFFFFF',
    buttonTextColor: '#FFFFFF',
    buttonBackgroundColor: '#007AFF'
  })
  const [uploading, setUploading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)

  const { data: heroSections, isLoading } = useHeroSections()
  const createMutation = useCreateHero()
  const updateMutation = useUpdateHero()
  const deleteMutation = useDeleteHero()
  const uploadMutation = useUploadHeroImage()

  React.useEffect(() => {
    if (!isLoading && initialLoad) {
      setInitialLoad(false)
    }
  }, [isLoading, initialLoad])

  if (isLoading && initialLoad) {
    return <PageLoader />
  }

  const handleOpenDialog = (hero?: HeroSection) => {
    if (hero) {
      setEditingHero(hero)
      setFormData({
        headline: hero.headline,
        subheadline: hero.subheadline,
        imageUrl: hero.imageUrl,
        buttonText: hero.buttonText,
        buttonLink: hero.buttonLink,
        isActive: hero.isActive,
        displayOrder: hero.displayOrder,
        titleColor: hero.titleColor || '#FFFFFF',
        subtitleColor: hero.subtitleColor || '#FFFFFF',
        buttonTextColor: hero.buttonTextColor || '#FFFFFF',
        buttonBackgroundColor: hero.buttonBackgroundColor || '#007AFF'
      })
    } else {
      setEditingHero(null)
      setFormData({
        headline: '',
        subheadline: '',
        imageUrl: '',
        buttonText: '',
        buttonLink: '',
        isActive: true,
        displayOrder: 0,
        titleColor: '#FFFFFF',
        subtitleColor: '#FFFFFF',
        buttonTextColor: '#FFFFFF',
        buttonBackgroundColor: '#007AFF'
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingHero(null)
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const url = await uploadMutation.mutateAsync(file)
      setFormData({ ...formData, imageUrl: url })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (editingHero) {
      await updateMutation.mutateAsync({
        id: editingHero.id,
        input: formData
      })
    } else {
      await createMutation.mutateAsync(formData)
    }
    handleCloseDialog()
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this hero section?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleToggleActive = async (hero: HeroSection) => {
    await updateMutation.mutateAsync({
      id: hero.id,
      input: { isActive: !hero.isActive }
    })
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>Dashboard Hero</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage hero sections displayed on the dashboard
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={() => handleOpenDialog()}
        >
          Add Hero Section
        </Button>
      </Box>

      {/* Hero Sections Table */}
      <TableContainer component={Paper} sx={{ bgcolor: 'background.paper' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Subtitle</TableCell>
              <TableCell>CTA</TableCell>
              <TableCell>Order</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {heroSections?.map((hero) => (
              <TableRow key={hero.id}>
                <TableCell>
                  <Avatar
                    src={hero.imageUrl}
                    variant="rounded"
                    sx={{ width: 80, height: 60 }}
                  >
                    <ImageOutlined />
                  </Avatar>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {hero.headline}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
                    {hero.subheadline}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{hero.buttonText}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={hero.displayOrder} size="small" />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={hero.isActive}
                    onChange={() => handleToggleActive(hero)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(hero)}
                    sx={{ mr: 1 }}
                  >
                    <EditOutlined fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(hero.id)}
                    color="error"
                  >
                    <DeleteOutlined fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {(!heroSections || heroSections.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No hero sections yet. Click "Add Hero Section" to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingHero ? 'Edit Hero Section' : 'Add Hero Section'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Headline"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Subheadline"
              value={formData.subheadline}
              onChange={(e) => setFormData({ ...formData, subheadline: e.target.value })}
              fullWidth
              multiline
              rows={3}
              required
            />
            
            {/* Image Upload */}
            <Box>
              <Typography variant="body2" gutterBottom>
                Hero Image
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<ImageOutlined />}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload Image'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </Button>
                {formData.imageUrl && (
                  <Avatar
                    src={formData.imageUrl}
                    variant="rounded"
                    sx={{ width: 120, height: 80 }}
                  />
                )}
              </Box>
              <TextField
                label="Or enter image URL"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                fullWidth
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>

            <TextField
              label="Button Text"
              value={formData.buttonText}
              onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Button Link"
              value={formData.buttonLink}
              onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
              fullWidth
              placeholder="/path or https://..."
              required
            />
            <TextField
              label="Display Order"
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
              fullWidth
              helperText="Lower numbers appear first"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Active"
            />

            {/* Color Customization Section */}
            <Box sx={{ borderTop: '1px solid #e0e0e0', pt: 2, mt: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: '0.95rem', fontWeight: 600 }}>
                Colors
              </Typography>
              
              {/* Title Color */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>Title Color</Typography>
                  <TextField
                    type="color"
                    value={formData.titleColor || '#FFFFFF'}
                    onChange={(e) => setFormData({ ...formData, titleColor: e.target.value })}
                    fullWidth
                    size="small"
                    inputProps={{ style: { cursor: 'pointer', height: 40 } }}
                  />
                </Box>
                <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                  {formData.titleColor || '#FFFFFF'}
                </Typography>
              </Box>

              {/* Subtitle Color */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>Subtitle Color</Typography>
                  <TextField
                    type="color"
                    value={formData.subtitleColor || '#FFFFFF'}
                    onChange={(e) => setFormData({ ...formData, subtitleColor: e.target.value })}
                    fullWidth
                    size="small"
                    inputProps={{ style: { cursor: 'pointer', height: 40 } }}
                  />
                </Box>
                <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                  {formData.subtitleColor || '#FFFFFF'}
                </Typography>
              </Box>

              {/* Button Text Color */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>Button Text Color</Typography>
                  <TextField
                    type="color"
                    value={formData.buttonTextColor || '#FFFFFF'}
                    onChange={(e) => setFormData({ ...formData, buttonTextColor: e.target.value })}
                    fullWidth
                    size="small"
                    inputProps={{ style: { cursor: 'pointer', height: 40 } }}
                  />
                </Box>
                <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                  {formData.buttonTextColor || '#FFFFFF'}
                </Typography>
              </Box>

              {/* Button Background Color */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>Button Background Color</Typography>
                  <TextField
                    type="color"
                    value={formData.buttonBackgroundColor || '#007AFF'}
                    onChange={(e) => setFormData({ ...formData, buttonBackgroundColor: e.target.value })}
                    fullWidth
                    size="small"
                    inputProps={{ style: { cursor: 'pointer', height: 40 } }}
                  />
                </Box>
                <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                  {formData.buttonBackgroundColor || '#007AFF'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.headline || !formData.subheadline || !formData.imageUrl || !formData.buttonText || !formData.buttonLink}
          >
            {editingHero ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default DashboardHeroPage
