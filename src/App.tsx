import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import moment from 'moment';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { Thermostat, WaterDrop, Air } from '@mui/icons-material';

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTHFmK0U_uQdFXRTV3FOTSCoVwGLIxBQjEa3mgPkdzQWQ_kFQJ0eOY9bRGUUvAx8GkowDCO1fPoYL17/pub?gid=0&single=true&output=csv';
  
    fetch(SHEET_CSV_URL)
      .then((res) => res.text())
      .then((csvText) => {
        const rows = XLSX.read(csvText, { type: 'string' }).Sheets.Sheet1;
        const jsonData = XLSX.utils.sheet_to_json(rows, { raw: true });
  
        const parsedData = jsonData.map((row) => {
          let timestamp = row.Timestamp;
          if (!isNaN(timestamp)) {
            const dateObj = XLSX.SSF.parse_date_code(timestamp);
            timestamp = new Date(Date.UTC(
              dateObj.y,
              dateObj.m - 1,
              dateObj.d,
              dateObj.H,
              dateObj.M,
              dateObj.S
            )).toISOString();
          }
          return {
            ...row,
            Timestamp: timestamp,
          };
        });
  
        setData(parsedData);
      });
  }, []);
  

  const latest = data.length > 0 ? data[data.length - 1] : null;

  const getSummary = (key) => {
    const values = data.map((d) => Number(d[key])).filter((v) => !isNaN(v));
    const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
    const min = Math.min(...values).toFixed(2);
    const max = Math.max(...values).toFixed(2);
    return { avg, min, max };
  };

  const getAirQualityStatus = (temp, humidity) => {
    if (temp >= 18 && temp <= 28 && humidity >= 30 && humidity <= 60) return { status: 'Good', color: '#c8e6c9' };
    if ((temp >= 16 && temp < 18) || (temp > 28 && temp <= 32) ||
        (humidity >= 25 && humidity < 30) || (humidity > 60 && humidity <= 70))
      return { status: 'Moderate', color: '#fff9c4' };
    return { status: 'Poor', color: '#ffcdd2' };
  };

  const tempSummary = getSummary('Temperature');
  const humiditySummary = getSummary('Humidity');
  const airStatus = latest ? getAirQualityStatus(Number(latest.Temperature), Number(latest.Humidity)) : null;

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Air Quality Dashboard
      </Typography>

      {latest && (
        <>
          <Typography variant="h6" gutterBottom>
            Last Updated: {moment(latest.Timestamp).format('YYYY-MM-DD HH:mm:ss')}
          </Typography>

          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ backgroundColor: '#ffebee', borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    <Thermostat sx={{ verticalAlign: 'middle', color: '#f44336' }} /> Latest Temperature
                  </Typography>
                  <Typography variant="h4" color="error" sx={{ mt: 1 }}>
                    {latest.Temperature} °C
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ backgroundColor: '#e3f2fd', borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    <WaterDrop sx={{ verticalAlign: 'middle', color: '#2196f3' }} /> Latest Humidity
                  </Typography>
                  <Typography variant="h4" color="primary" sx={{ mt: 1 }}>
                    {latest.Humidity} %
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ backgroundColor: airStatus?.color || '#f5f5f5', borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    <Air sx={{ verticalAlign: 'middle', color: '#555' }} /> Air Quality Status
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 1 }}>
                    {airStatus?.status || 'N/A'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ backgroundColor: '#fff3e0', borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Avg Temperature
              </Typography>
              <Typography variant="h5" sx={{ mt: 1 }}>{tempSummary.avg} °C</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Min: {tempSummary.min} | Max: {tempSummary.max}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ backgroundColor: '#e8f5e9', borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Avg Humidity
              </Typography>
              <Typography variant="h5" sx={{ mt: 1 }}>{humiditySummary.avg} %</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Min: {humiditySummary.min} | Max: {humiditySummary.max}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="Timestamp" tickFormatter={(t) => moment(t).format('HH:mm')} />
          <YAxis />
          <Tooltip labelFormatter={(label) => moment(label).format('YYYY-MM-DD HH:mm:ss')} />
          <Legend />
          <Line type="monotone" dataKey="Temperature" stroke="#f44336" />
          <Line type="monotone" dataKey="Humidity" stroke="#2196f3" />
        </LineChart>
      </ResponsiveContainer>

      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Raw Logs
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Temperature (°C)</TableCell>
              <TableCell>Humidity (%)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, i) => (
              <TableRow key={i}>
                <TableCell>{moment(row.Timestamp).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
                <TableCell>{row.Temperature}</TableCell>
                <TableCell>{row.Humidity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default App;
