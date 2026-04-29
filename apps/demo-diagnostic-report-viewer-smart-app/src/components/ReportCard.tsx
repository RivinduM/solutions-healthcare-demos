import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Stack,
  Divider,
  Link,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import ScienceIcon from "@mui/icons-material/Science";
import RadioIcon from "@mui/icons-material/Radio";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { DiagnosticReport } from "../types";

type ChipColor = "primary" | "secondary" | "error" | "default";

interface CategoryConfig {
  label: string;
  color: ChipColor;
  icon: React.ReactNode;
}

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  LAB: { label: "Laboratory", color: "primary", icon: <ScienceIcon fontSize="small" /> },
  RAD: { label: "Radiology", color: "secondary", icon: <RadioIcon fontSize="small" /> },
  CARD: { label: "Cardiology", color: "error", icon: <FavoriteIcon fontSize="small" /> },
};

function getCategoryCode(report: DiagnosticReport): string {
  return report.category?.[0]?.coding?.[0]?.code ?? "";
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface ReportCardProps {
  report: DiagnosticReport;
}

export default function ReportCard({ report }: ReportCardProps) {
  const catCode = getCategoryCode(report);
  const cat: CategoryConfig = CATEGORY_CONFIG[catCode] ?? {
    label: catCode || "Other",
    color: "default",
    icon: <AssignmentIcon fontSize="small" />,
  };
  const title =
    report.code?.text ?? report.code?.coding?.[0]?.display ?? "Unknown Report";
  const date = formatDate(report.effectiveDateTime ?? report.issued);

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        "&:hover": { boxShadow: 4 },
        transition: "box-shadow 0.2s",
      }}
    >
      <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={1}
        >
          <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1, mr: 1 }}>
            {title}
          </Typography>
          <Chip
            icon={cat.icon as React.ReactElement}
            label={cat.label}
            color={cat.color}
            size="small"
            variant="outlined"
          />
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
          <Typography variant="caption" color="text.secondary">
            {date}
          </Typography>
          <Chip
            label={report.status ?? "unknown"}
            size="small"
            color={report.status === "final" ? "success" : "default"}
            sx={{ height: 18, fontSize: 11 }}
          />
        </Stack>

        {report.conclusion && (
          <>
            <Divider sx={{ mb: 1.5 }} />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontStyle: "italic", flex: 1 }}
            >
              {report.conclusion}
            </Typography>
          </>
        )}

        {report.result && report.result.length > 0 && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              RESULTS ({report.result.length})
            </Typography>
            <List dense disablePadding>
              {report.result.map((r, i) => (
                <ListItem key={i} disablePadding>
                  <ListItemText
                    primary={r.reference}
                    primaryTypographyProps={{
                      variant: "caption",
                      color: "text.secondary",
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}

        {report.presentedForm && report.presentedForm.length > 0 && (
          <Box mt="auto" pt={1.5}>
            <Divider sx={{ mb: 1.5 }} />
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {report.presentedForm.map((form, i) => (
                <Link
                  key={i}
                  href={form.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="caption"
                >
                  {form.title ?? "View Report"}
                </Link>
              ))}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
