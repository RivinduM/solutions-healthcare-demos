import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import PersonIcon from "@mui/icons-material/Person";
import DnsIcon from "@mui/icons-material/Dns";

interface LaunchScreenProps {
  patientId: string;
  launchId: string;
  fhirServer: string;
  isDiscovering: boolean;
  error?: string;
  onAuthorize: () => void;
}

export default function LaunchScreen({
  patientId,
  launchId,
  fhirServer,
  isDiscovering,
  error,
  onAuthorize,
}: LaunchScreenProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #e3f2fd 0%, #3d75a3 100%)",
      }}
    >
      <Card sx={{ width: 480, borderRadius: 3, boxShadow: 6 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <LocalHospitalIcon sx={{ fontSize: 52, color: "#1565c0" }} />
            <Typography variant="h5" fontWeight={700} color="primary" mt={1}>
              Diagnostic Reports Viewer
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              SMART on FHIR Application
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {launchId && (
            <>
              <Typography variant="overline" color="text.secondary">
                Launch Context
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={1.5} mb={3}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Launch ID:
                  </Typography>
                  <Chip label={launchId} size="small" color="primary" variant="outlined" />
                </Stack>
                <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                  <DnsIcon fontSize="small" color="action" sx={{ mt: 0.3 }} />
                  <Typography variant="body2" color="text.secondary">
                    FHIR Server:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ wordBreak: "break-all", fontFamily: "monospace", fontSize: 12 }}
                  >
                    {fhirServer}
                  </Typography>
                </Stack>
              </Stack>
            </>
          )}

          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={
              isDiscovering ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <VpnKeyIcon />
              )
            }
            onClick={onAuthorize}
            disabled={isDiscovering}
          >
            {isDiscovering ? "Discovering endpoints..." : "Authorize"}
          </Button>

          <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1.5}>
            You will be redirected to authenticate and grant access.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
